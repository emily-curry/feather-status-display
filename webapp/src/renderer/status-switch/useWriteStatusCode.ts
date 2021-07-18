import { useCallback } from 'react';
import { BLE_CHR_STATUS_CODE, BLE_SERVICE_STATUS } from '../util/constants';
import { StatusCode } from '../util/statusCode';

export const useWriteStatusCode = (gatt: BluetoothRemoteGATTServer) => {
  return useCallback(
    async (statusCode: StatusCode) => {
      const svc = await gatt.getPrimaryService(BLE_SERVICE_STATUS);
      const chr = await svc.getCharacteristic(BLE_CHR_STATUS_CODE);
      await chr.writeValueWithoutResponse(new Uint8Array([statusCode]));
    },
    [gatt],
  );
};
