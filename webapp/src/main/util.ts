import { nativeImage } from 'electron';
import { join } from 'path';

export const nativeIcon = nativeImage.createFromPath(
  join(__dirname, 'favicon.ico'),
);
