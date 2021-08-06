import { useCallback } from 'react';
import {
  UUID16_CHR_IMAGE_CONTROL,
  UUID16_CHR_IMAGE_WRITER,
  UUID16_SVC_IMAGE,
} from '../util/constants';
import { StatusCode } from '../util/statusCode';

export const useWriteFile = (gatt: BluetoothRemoteGATTServer) => {
  return useCallback(
    async (file: ArrayBuffer, code: StatusCode): Promise<void> => {
      const imageService = await gatt.getPrimaryService(UUID16_SVC_IMAGE);
      const controlChr = await imageService.getCharacteristic(
        UUID16_CHR_IMAGE_CONTROL,
      );
      // Initiate write to status code
      await controlChr.writeValueWithResponse(new Uint8Array([1, code]));

      try {
        const writerChr = await imageService.getCharacteristic(
          UUID16_CHR_IMAGE_WRITER,
        );
        for (let offset = 0; offset < file.byteLength; offset += 508) {
          const offsetArray = new Uint32Array([offset]);
          const view = new Uint8Array(
            file.slice(offset, Math.min(offset + 508, file.byteLength)),
          );
          const data = new Uint8Array(offsetArray.byteLength + view.byteLength);
          data.set(new Uint8Array(offsetArray.buffer), 0);
          data.set(view, offsetArray.byteLength);
          await writerChr.writeValueWithResponse(data);
        }
      } finally {
        await controlChr.writeValueWithResponse(new Uint8Array([2]));
      }
    },
    [gatt],
  );
};
