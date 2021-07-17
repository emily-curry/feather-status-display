import { useFeatherGatt } from '../util/useFeatherDevice';
import { useCallback } from 'react';
import { StatusCode } from '../util/statusCode';
import { BLE_CHR_STATUS_CODE, BLE_SERVICE_STATUS } from '../util/constants';

export const useWriteStatusCode = () => {
  const gatt = useFeatherGatt();

  return useCallback(
    async (statusCode: StatusCode) => {
      if (!gatt) return;
      const svc = await gatt.getPrimaryService(BLE_SERVICE_STATUS);
      const chr = await svc.getCharacteristic(BLE_CHR_STATUS_CODE);
      await chr.writeValueWithResponse(new Uint8Array([statusCode]));
      console.log('complete');
    },
    [gatt],
  );
};
