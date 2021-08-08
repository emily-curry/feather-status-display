import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { BluetoothDeviceState } from '../state';
import { StatusPicker } from '../status-picker/StatusPicker';
import { StatusCode } from '../util/statusCode';
import { useFeatherControl } from '../util/useFeatherDevice';
import './StatusSwitch.css';

export const StatusSwitch: React.FC = () => {
  const { state, refreshStatusCode, writeStatusCode } = useFeatherControl();
  return state.device ? (
    <_StatusSwitch
      device={state.device}
      isLoading={state.isLoading}
      refresh={refreshStatusCode}
      write={writeStatusCode}
    />
  ) : (
    <></>
  );
};

const _StatusSwitch: React.FC<{
  device: BluetoothDeviceState;
  refresh: () => Promise<void>;
  write: (code: StatusCode) => Promise<void>;
  isLoading: boolean;
}> = ({ device, refresh, write, isLoading }) => {
  const [localStatusCode, setLocalStatusCode] = useState<
    StatusCode | undefined
  >();

  useEffect(() => {
    setLocalStatusCode(device.status);
  }, [device, setLocalStatusCode]);

  const handleRefresh = useCallback(async () => {
    setLocalStatusCode(undefined);
    await refresh();
  }, [refresh, setLocalStatusCode]);

  const handleSubmit = useCallback(async () => {
    if (localStatusCode === undefined) return;
    await write(localStatusCode);
  }, [localStatusCode, write]);

  return (
    <div>
      <h2>Status Code</h2>
      <div id="status-switch-form">
        <button onClick={handleRefresh} disabled={isLoading}>
          Refresh
        </button>
        <StatusPicker
          value={localStatusCode}
          onChange={setLocalStatusCode}
          disabled={isLoading}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || localStatusCode === undefined}
        >
          Set
        </button>
      </div>
    </div>
  );
};
