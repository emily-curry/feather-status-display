import { useEffect, useState, useMemo } from 'react';

export const useBattery = (gatt: BluetoothRemoteGATTServer) => {
  const [battery, setBattery] = useState<number | undefined>(undefined);

  useEffect(() => {
    let cleanup: undefined | (() => any);
    const exec = async () => {
      const batteryService = await gatt.getPrimaryService('battery_service');
      const batteryLevel = await batteryService.getCharacteristic(
        'battery_level',
      );
      const callback = (ev: any) => {
        console.log('cb', ev.target.value);
        const value = ev.target.value.getUint8(0);
        if (typeof value === 'number') setBattery(value);
        else setBattery(undefined);
      };
      batteryLevel.addEventListener('characteristicvaluechanged', callback);
      cleanup = () =>
        batteryLevel.removeEventListener(
          'characteristicvaluechanged',
          callback,
        );
      await batteryLevel.readValue();
    };
    exec();
    return cleanup;
  }, [gatt, setBattery]);

  useEffect(() => {
    console.log(battery);
  }, [battery]);

  return useMemo(() => {
    if (battery === undefined) return '??';
    else return battery.toString().padStart(2, '0') + '%';
  }, [battery]);
};
