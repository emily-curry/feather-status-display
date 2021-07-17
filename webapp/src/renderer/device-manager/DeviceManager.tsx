import React from 'react';
import { useFeatherControl } from '../util/useFeatherDevice';

export const DeviceManager: React.FC = () => {
  const { connect, disconnect, gatt, isLoading } = useFeatherControl();
  return (
    <div>
      <h2>Device Manager</h2>
      {!!gatt?.connected ? (
        <span>
          Connected - {gatt.device.name} -{' '}
          <button disabled={isLoading} onClick={disconnect}>
            Disconnect
          </button>
        </span>
      ) : (
        <span>
          {'Not connected - '}
          <button disabled={isLoading} onClick={connect}>
            Connect
          </button>
        </span>
      )}
    </div>
  );
};
