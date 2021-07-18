import React from 'react';
import { useFeatherControl } from '../util/useFeatherDevice';
import { BatteryDisplay } from './BatteryDisplay';

export const DeviceManager: React.FC = () => {
  const { connect, disconnect, gatt, isLoading } = useFeatherControl();
  return (
    <div>
      <h2>Device Manager</h2>
      {!!gatt?.connected ? (
        <>
          <div className="flex-between">
            <span>Connected</span>
            <button disabled={isLoading} onClick={disconnect}>
              Disconnect
            </button>
          </div>
          <div className="flex-between">
            <span>Device Name:</span>
            <span>{gatt.device.name}</span>
          </div>
          <BatteryDisplay gatt={gatt} />
        </>
      ) : (
        <div className="flex-between">
          <span>Not connected</span>
          <button disabled={isLoading} onClick={connect}>
            Connect
          </button>
        </div>
      )}
    </div>
  );
};
