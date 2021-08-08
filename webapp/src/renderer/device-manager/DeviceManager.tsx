import React from 'react';
import { useFeatherControl } from '../util/useFeatherDevice';
import { BatteryDisplay } from './BatteryDisplay';

export const DeviceManager: React.FC = () => {
  const { connect, disconnect, state } = useFeatherControl();
  return (
    <div>
      <h2>Device Manager</h2>
      {!!state.device ? (
        <>
          <div className="flex-between">
            <span>Connected</span>
            <button disabled={state.isLoading} onClick={disconnect}>
              Disconnect
            </button>
          </div>
          <div className="flex-between">
            <span>Device Name:</span>
            <span>{state.device.name}</span>
          </div>
          <BatteryDisplay battery={state.device.battery} />
        </>
      ) : (
        <div className="flex-between">
          <span>Not connected</span>
          <button disabled={state.isLoading} onClick={connect}>
            Connect
          </button>
        </div>
      )}
    </div>
  );
};
