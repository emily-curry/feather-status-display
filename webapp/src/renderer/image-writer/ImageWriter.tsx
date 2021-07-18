import React, { useState, useCallback, FormEvent, useRef } from 'react';
import { StatusPicker } from '../status-picker/StatusPicker';
import { StatusCode } from '../util/statusCode';
import { useFeatherGatt } from '../util/useFeatherDevice';
import './ImageWriter.css';
import { useReadFile } from './useReadFile';
import { useWriteFile } from './useWriteFile';

export const ImageWriter: React.FC = () => {
  const gatt = useFeatherGatt();
  return gatt?.connected ? <_ImageWriter gatt={gatt} /> : <></>;
};

const _ImageWriter: React.FC<{ gatt: BluetoothRemoteGATTServer }> = (props) => {
  const readFile = useReadFile();
  const writeFile = useWriteFile(props.gatt);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [statusCode, setStatusCode] = useState<StatusCode | undefined>(
    undefined,
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const exec = async () => {
        if (!file || statusCode === undefined) return;
        setIsLoading(true);
        try {
          const parsed = await readFile(file);
          await writeFile(parsed, statusCode);
        } finally {
          setIsLoading(false);
        }
      };
      exec();
    },
    [file, setIsLoading, readFile, writeFile, statusCode],
  );

  return (
    <div>
      <h2>Image Writer</h2>
      <form id="image-writer-form" onSubmit={handleSubmit}>
        <div className="flex-between">
          <label>Status: </label>
          <StatusPicker
            disabled={isLoading}
            value={statusCode}
            onChange={setStatusCode}
          />
        </div>
        <div className="flex-between">
          <label>File: </label>
          <button onClick={() => fileInputRef?.current?.click()}>
            {file ? file.name : 'Choose'}
          </button>
        </div>
        <button
          type="submit"
          disabled={isLoading || statusCode === undefined || file === undefined}
        >
          Update
        </button>
        <input
          ref={(el) => (fileInputRef.current = el)}
          type="file"
          disabled={isLoading}
          onChange={(e) => setFile(e.target?.files?.[0])}
        />
      </form>
    </div>
  );
};
