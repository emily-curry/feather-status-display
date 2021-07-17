import { useCallback, useEffect, useState } from 'react';
import { BLE_CHR_STATUS_CODE, BLE_SERVICE_STATUS } from '../util/constants';
import { useFeatherGatt } from '../util/useFeatherDevice';

export const useReadStatusCode = () => {
  const gatt = useFeatherGatt();
  const [value, setValue] = useState<any>(undefined);

  useEffect(() => {
    let chr: BluetoothRemoteGATTCharacteristic | undefined;

    const callback = (event: any) => {
      const cbValue = event.target.value.getUint8(0);
      console.log(event);
    };

    const exec = async () => {
      if (!gatt) return;
      const svc = await gatt.getPrimaryService(BLE_SERVICE_STATUS);
      const chr = await svc.getCharacteristic(BLE_CHR_STATUS_CODE);
      chr.addEventListener('characteristicvaluechanged', callback);
      await chr.readValue();
    };
    exec();

    return () => {
      chr?.removeEventListener('characteristicvaluechanged', callback);
    };
  }, [setValue, gatt]);

  return useCallback(async () => {
    if (!gatt) return undefined;
    const svc = await gatt.getPrimaryService(BLE_SERVICE_STATUS);
    const chr = await svc.getCharacteristic(BLE_CHR_STATUS_CODE);
    const value = chr.value;
    return undefined;
  }, [gatt]);
};
