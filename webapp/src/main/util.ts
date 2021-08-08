import { nativeImage } from 'electron';
import { join } from 'path';

export const platform =
  process.platform === 'darwin'
    ? 'darwin'
    : process.platform.includes('win')
    ? 'win'
    : 'linux';

export const nativeIconSmall = nativeImage.createFromPath(
  join(__dirname, platform === 'win' ? 'favicon.ico' : 'icon-small.png'),
);

export const nativeIconLarge = nativeImage.createFromPath(
  join(__dirname, platform === 'win' ? 'favicon.ico' : 'icon.png'),
);
