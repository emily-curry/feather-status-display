import React, { useCallback, useContext, useMemo, useState } from 'react';
import { BLE_SERVICE_STATUS, UUID16_SVC_IMAGE } from './constants';

const EVENT_DEVICE_CONNECTED = 'EVENT_DEVICE_CONNECTED';
const EVENT_DEVICE_DISCONNECTED = 'EVENT_DEVICE_DISCONNECTED';

export interface FeatherContextControl {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  gatt?: BluetoothRemoteGATTServer;
  isLoading: boolean;
}

const FeatherContext = React.createContext<FeatherContextControl>({} as any);

export const FeatherProvider: React.FC = (props) => {
  const [isLoading, setLoading] = useState(false);
  const [device, setDevice] = useState<undefined | BluetoothDevice>(undefined);
  const [gatt, setGatt] =
    useState<undefined | BluetoothRemoteGATTServer>(undefined);

  const connect = useCallback(async () => {
    try {
      setLoading(true);
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [BLE_SERVICE_STATUS] }],
        optionalServices: ['battery_service', UUID16_SVC_IMAGE],
      });
      setDevice(device);
      setGatt(await device.gatt?.connect());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [setDevice, setGatt, setLoading]);

  const disconnect = useCallback(async () => {
    try {
      await gatt?.disconnect();
    } finally {
      setDevice(undefined);
      setGatt(undefined);
    }
  }, [gatt, setGatt, setDevice]);

  const control: FeatherContextControl = useMemo(() => {
    return {
      connect,
      disconnect,
      gatt,
      isLoading,
    };
  }, [connect, gatt, isLoading, disconnect]);

  return (
    <FeatherContext.Provider value={control}>
      {props.children}
    </FeatherContext.Provider>
  );
};

export const useFeatherControl = (): FeatherContextControl => {
  return useContext(FeatherContext);
};

export const useFeatherGatt = (): BluetoothRemoteGATTServer | undefined => {
  return useContext(FeatherContext)?.gatt;
};
