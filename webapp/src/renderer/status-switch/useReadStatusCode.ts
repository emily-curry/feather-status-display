import { useCallback } from 'react';
import { BLE_CHR_STATUS_CODE, BLE_SERVICE_STATUS } from '../constants';

export const useReadStatusCode = (gatt: BluetoothRemoteGATTServer) => {
  return useCallback(async () => {
    const svc = await gatt.getPrimaryService(BLE_SERVICE_STATUS);
    const chr = await svc.getCharacteristic(BLE_CHR_STATUS_CODE);
    const value = await chr.readValue();
    const int8 = value.getInt8(0);
    return int8 ?? undefined;
  }, [gatt]);
};
