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
  const [gatt, setGatt] = useState<undefined | BluetoothRemoteGATTServer>(
    undefined,
  );

  const connect = useCallback(async () => {
    try {
      setLoading(true);
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [BLE_SERVICE_STATUS] }],
        optionalServices: ['battery_service', UUID16_SVC_IMAGE],
      });
      setDevice(device);

      let retryCount = 0;
      const retryConnect = async () => {
        if (retryCount >= 5) {
          setDevice(undefined);
        } else {
          retryCount++;
          setLoading(true);

          let server: BluetoothRemoteGATTServer | undefined;
          try {
            server = await device.gatt?.connect();
          } finally {
            if (server) {
              setGatt(server);
              setLoading(false);
            } else {
              await new Promise((r) =>
                window.setTimeout(r, retryCount * 10000),
              );
              setLoading(false);
              await retryConnect();
            }
          }
        }
      };

      device.ongattserverdisconnected = (ev) => {
        setGatt(undefined);
        retryConnect();
      };

      if (device.gatt) {
        const server = await device.gatt.connect();
        setGatt(server);
      } else {
        setGatt(undefined);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [setDevice, setGatt, setLoading]);

  const disconnect = useCallback(async () => {
    try {
      if (device) device.ongattserverdisconnected = () => {};
      await device?.gatt?.disconnect();
    } finally {
      setDevice(undefined);
      setGatt(undefined);
    }
  }, [device, setGatt, setDevice]);

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
