import { nativeImage } from 'electron';
import { join } from 'path';

export const nativeIconSmall = nativeImage.createFromPath(
  join(__dirname, 'icon-small.png'),
);

export const nativeIconLarge = nativeImage.createFromPath(
  join(__dirname, 'icon.png'),
);
