import {
  LogLevel,
  Logger,
  LoggerOptions,
  ICachePlugin,
  TokenCacheContext,
} from '@azure/msal-common';
import { join, dirname } from 'path';
import {
  writeFile,
  readFile,
  unlink,
  stat,
  open,
  mkdir,
  FileHandle,
} from 'fs/promises';
import { app } from 'electron';
import { pid } from 'process';

/**
 * Code taken from @azure/msal-node-extensions, but without any native deps.
 */

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Error thrown when trying to write MSAL cache to persistence.
 */
class PersistenceError extends Error {
  public errorCode: any;
  public errorMessage: string;
  constructor(errorCode: any, errorMessage: string) {
    const errorString = errorMessage
      ? `${errorCode}: ${errorMessage}`
      : errorCode;
    super(errorString);
    Object.setPrototypeOf(this, PersistenceError.prototype);
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
    this.name = 'PersistenceError';
  }
  /**
   * Error thrown when trying to access the file system.
   */
  static createFileSystemError(errorCode: any, errorMessage: string) {
    return new PersistenceError(errorCode, errorMessage);
  }
  /**
   * Error thrown when trying to write, load, or delete data from secret service on linux.
   * Libsecret is used to access secret service.
   */
  static createLibSecretError(errorMessage: string) {
    return new PersistenceError('GnomeKeyringError', errorMessage);
  }
  /**
   * Error thrown when trying to write, load, or delete data from keychain on macOs.
   */
  static createKeychainPersistenceError(errorMessage: string) {
    return new PersistenceError('KeychainError', errorMessage);
  }
  /**
   * Error thrown when trying to encrypt or decrypt data using DPAPI on Windows.
   */
  static createFilePersistenceWithDPAPIError(errorMessage: string) {
    return new PersistenceError('DPAPIEncryptedFileError', errorMessage);
  }
  /**
   * Error thrown when using the cross platform lock.
   */
  static createCrossPlatformLockError(errorMessage: string) {
    return new PersistenceError('CrossPlatformLockError', errorMessage);
  }
  /**
   * Throw cache persistence error
   *
   * @param errorMessage string
   * @returns PersistenceError
   */
  static createCachePersistenceError(errorMessage: string) {
    return new PersistenceError('CachePersistenceError', errorMessage);
  }
}

/**
 * Cross-process lock that works on all platforms.
 */
class CrossPlatformLock {
  retryNumber: number;
  retryDelay: number;
  logger: Logger;
  lockFilePath: string;
  lockFileHandle?: FileHandle;

  constructor(lockFilePath: string, logger?: Logger, lockOptions?: any) {
    this.lockFilePath = lockFilePath;
    this.retryNumber = lockOptions ? lockOptions.retryNumber : 500;
    this.retryDelay = lockOptions ? lockOptions.retryDelay : 100;
    this.logger =
      logger ?? new Logger(ElectronPersistence.createDefaultLoggerOptions());
  }
  /**
   * Locks cache from read or writes by creating file with same path and name as
   * cache file but with .lockfile extension. If another process has already created
   * the lockfile, will back off and retry based on configuration settings set by CrossPlatformLockOptions
   */
  async lock() {
    for (let tryCount = 0; tryCount < this.retryNumber; tryCount++) {
      try {
        this.logger.info(`Pid ${pid} trying to acquire lock`);
        this.lockFileHandle = await open(this.lockFilePath, 'wx+');
        this.logger.info(`Pid ${pid} acquired lock`);
        await this.lockFileHandle.write(pid.toString());
        return;
      } catch (err) {
        if (err.code === 'EEXIST' || err.code === 'EPERM') {
          this.logger.info(err);
          await this.sleep(this.retryDelay);
        } else {
          this.logger.error(
            `${pid} was not able to acquire lock. Ran into error: ${err.message}`,
          );
          throw PersistenceError.createCrossPlatformLockError(err.message);
        }
      }
    }

    this.logger.error(
      `${pid} was not able to acquire lock. Exceeded amount of retries set in the options`,
    );
    throw PersistenceError.createCrossPlatformLockError(
      'Not able to acquire lock. Exceeded amount of retries set in options',
    );
  }
  /**
   * unlocks cache file by deleting .lockfile.
   */
  async unlock() {
    try {
      if (this.lockFileHandle) {
        // if we have a file handle to the .lockfile, delete lock file
        await unlink(this.lockFilePath);
        await this.lockFileHandle.close();
        this.logger.info('lockfile deleted');
      } else {
        this.logger.warning(
          'lockfile handle does not exist, so lockfile could not be deleted',
        );
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        this.logger.info('Tried to unlock but lockfile does not exist');
      } else {
        this.logger.error(
          `${pid} was not able to release lock. Ran into error: ${err.message}`,
        );
        throw PersistenceError.createCrossPlatformLockError(err.message);
      }
    }
  }

  sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}

export class ElectronCachePlugin implements ICachePlugin {
  persistence: ElectronPersistence;
  logger: Logger;
  lockFilePath: string;
  crossPlatformLock: CrossPlatformLock;
  lastSync: number;
  currentCache: any;

  constructor(persistence: ElectronPersistence) {
    this.persistence = persistence;

    this.logger = this.persistence.getLogger(); // create file lock

    this.lockFilePath = `${this.persistence.getFilePath()}.lockfile`;
    this.crossPlatformLock = new CrossPlatformLock(
      this.lockFilePath,
      this.logger,
    ); // initialize default values

    this.lastSync = 0;
    this.currentCache = null;
  }

  static async create(): Promise<ElectronCachePlugin> {
    const p = await ElectronPersistence.create();
    return new ElectronCachePlugin(p);
  }
  /**
   * Reads from storage and saves an in-memory copy. If persistence has not been updated
   * since last time data was read, in memory copy is used.
   *
   * If cacheContext.cacheHasChanged === true, then file lock is created and not deleted until
   * afterCacheAccess() is called, to prevent the cache file from changing in between
   * beforeCacheAccess() and afterCacheAccess().
   */
  async beforeCacheAccess(cacheContext: TokenCacheContext) {
    this.logger.info('Executing before cache access');
    const reloadNecessary = await this.persistence.reloadNecessary(
      this.lastSync,
    );

    if (!reloadNecessary && this.currentCache !== null) {
      if (cacheContext.cacheHasChanged) {
        this.logger.verbose('Cache context has changed');
        await this.crossPlatformLock.lock();
      }

      return;
    }

    try {
      this.logger.info(`Reload necessary. Last sync time: ${this.lastSync}`);
      await this.crossPlatformLock.lock();
      this.currentCache = await this.persistence.load();
      this.lastSync = new Date().getTime();
      cacheContext.tokenCache.deserialize(this.currentCache);
      this.logger.info(`Last sync time updated to: ${this.lastSync}`);
    } finally {
      if (!cacheContext.cacheHasChanged) {
        await this.crossPlatformLock.unlock();
        this.logger.info(`Pid ${pid} released lock`);
      } else {
        this.logger.info(`Pid ${pid} beforeCacheAccess did not release lock`);
      }
    }
  }
  /**
   * Writes to storage if MSAL in memory copy of cache has been changed.
   */
  async afterCacheAccess(cacheContext: TokenCacheContext) {
    this.logger.info('Executing after cache access');

    try {
      if (cacheContext.cacheHasChanged) {
        this.logger.info(
          'Msal in-memory cache has changed. Writing changes to persistence',
        );
        this.currentCache = cacheContext.tokenCache.serialize();
        await this.persistence.save(this.currentCache);
      } else {
        this.logger.info(
          'Msal in-memory cache has not changed. Did not write to persistence',
        );
      }
    } finally {
      await this.crossPlatformLock.unlock();
      this.logger.info(`Pid ${pid} afterCacheAccess released lock`);
    }
  }
}

class ElectronPersistence {
  public logger!: Logger;
  public filePath!: string;

  static async create(loggerOptions?: LoggerOptions) {
    const electronPersistence = new ElectronPersistence();
    electronPersistence.filePath = join(
      app.getPath('userData'),
      'feather-status',
      'msal',
    );
    electronPersistence.logger = new Logger(
      loggerOptions || ElectronPersistence.createDefaultLoggerOptions(),
    );
    await electronPersistence.createCacheFile();
    return electronPersistence;
  }

  async save(contents: string) {
    try {
      await writeFile(this.getFilePath(), contents, 'utf-8');
    } catch (err) {
      throw PersistenceError.createFileSystemError(err.code, err.message);
    }
  }

  async saveBuffer(contents: Buffer) {
    try {
      await writeFile(this.getFilePath(), contents);
    } catch (err) {
      throw PersistenceError.createFileSystemError(err.code, err.message);
    }
  }

  async load() {
    try {
      return await readFile(this.getFilePath(), 'utf-8');
    } catch (err) {
      throw PersistenceError.createFileSystemError(err.code, err.message);
    }
  }

  async loadBuffer() {
    try {
      return await readFile(this.getFilePath());
    } catch (err) {
      throw PersistenceError.createFileSystemError(err.code, err.message);
    }
  }

  async delete() {
    try {
      await unlink(this.getFilePath());
      return true;
    } catch (err) {
      if (err.code === 'ENOENT') {
        // file does not exist, so it was not deleted
        this.logger?.warning(
          'Cache file does not exist, so it could not be deleted',
        );
        return false;
      }

      throw PersistenceError.createFileSystemError(err.code, err.message);
    }
  }

  getFilePath() {
    return this.filePath!;
  }

  async reloadNecessary(lastSync: number) {
    return lastSync < (await this.timeLastModified());
  }

  getLogger() {
    return this.logger;
  }

  static createDefaultLoggerOptions() {
    return {
      loggerCallback: () => {
        // allow users to not set loggerCallback
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Info,
    };
  }

  async timeLastModified() {
    try {
      const stats = await stat(this.filePath);
      return stats.mtime.getTime();
    } catch (err) {
      if (err.code === 'ENOENT') {
        // file does not exist, so it's never been modified
        this.logger.verbose('Cache file does not exist');
        return 0;
      }

      throw PersistenceError.createFileSystemError(err.code, err.message);
    }
  }

  async createCacheFile() {
    await this.createFileDirectory(); // File is created only if it does not exist

    const fileHandle = await open(this.filePath, 'a');
    await fileHandle.close();
    this.logger.info(`File created at ${this.filePath}`);
  }

  async createFileDirectory() {
    try {
      await mkdir(dirname(this.filePath), {
        recursive: true,
      });
    } catch (err) {
      if (err.code === 'EEXIST') {
        this.logger.info(`Directory ${dirname(this.filePath)}  already exists`);
      } else {
        throw PersistenceError.createFileSystemError(err.code, err.message);
      }
    }
  }
}
