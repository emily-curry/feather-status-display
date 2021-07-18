import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { StatusPicker } from '../status-picker/StatusPicker';
import { StatusCode } from '../util/statusCode';
import { useFeatherGatt } from '../util/useFeatherDevice';
import './StatusSwitch.css';
import { useReadStatusCode } from './useReadStatusCode';
import { useWriteStatusCode } from './useWriteStatusCode';

export const StatusSwitch: React.FC = () => {
  const gatt = useFeatherGatt();
  return gatt?.connected ? <_StatusSwitch gatt={gatt} /> : <></>;
};

const _StatusSwitch: React.FC<{ gatt: BluetoothRemoteGATTServer }> = (
  props,
) => {
  const writeStatusCode = useWriteStatusCode(props.gatt);
  const readStatusCode = useReadStatusCode(props.gatt);
  const [statusCode, setStatusCode] = useState<StatusCode | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const value = await readStatusCode();
      setStatusCode(value);
    } finally {
      setIsLoading(false);
    }
  }, [readStatusCode, setStatusCode, setIsLoading]);

  useEffect(() => {
    refresh();
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      const exec = async () => {
        if (statusCode === undefined) return;
        setIsLoading(true);
        try {
          await writeStatusCode(statusCode);
        } finally {
          setIsLoading(false);
        }
      };
      exec();
      e.preventDefault();
    },
    [statusCode, writeStatusCode, setIsLoading],
  );

  return (
    <div>
      <h2>Status Code</h2>
      <form id="status-switch-form" onSubmit={handleSubmit}>
        <button onClick={refresh} disabled={isLoading}>
          Refresh
        </button>
        <StatusPicker
          value={statusCode}
          onChange={setStatusCode}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || statusCode === undefined}>
          Set
        </button>
      </form>
    </div>
  );
};
