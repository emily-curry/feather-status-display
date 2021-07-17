import React, {
  useState,
  useCallback,
  ChangeEvent,
  FormEvent,
  useEffect,
} from 'react';
import { StatusCode } from '../util/statusCode';
import { useFeatherGatt } from '../util/useFeatherDevice';
import { useReadStatusCode } from './useReadStatusCode';
import { useWriteStatusCode } from './useWriteStatusCode';

export const StatusSwitch: React.FC = () => {
  const gatt = useFeatherGatt();
  return gatt?.connected ? <_StatusSwitch /> : <></>;
};

const _StatusSwitch: React.FC = () => {
  const writeStatusCode = useWriteStatusCode();
  const readStatusCode = useReadStatusCode();
  const [statusCode, setStatusCode] = useState<StatusCode | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const exec = async () => {
      setIsLoading(true);
      try {
        const value = await readStatusCode();
        setStatusCode(value);
      } finally {
        setIsLoading(false);
      }
    };
    exec();
  }, [setStatusCode, setIsLoading]);

  const handleStatusChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const status = parseInt(e.target.value);
      if (!isNaN(status)) setStatusCode(status as StatusCode);
      else setStatusCode(undefined);
    },
    [setStatusCode],
  );

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
      <div>
        <form onSubmit={handleSubmit}>
          <select
            name="status"
            onChange={handleStatusChange}
            value={statusCode}
            disabled={isLoading}
          >
            <option value={undefined}>--</option>
            <option value={StatusCode.STATUS_AVAILABLE}>Available</option>
            <option value={StatusCode.STATUS_OFFLINE}>Offline</option>
            <option value={StatusCode.STATUS_BUSY}>Busy</option>
            <option value={StatusCode.STATUS_DND}>Do Not Disturb</option>
            <option value={StatusCode.STATUS_UNKNOWN}>Unknown</option>
          </select>
          <button type="submit" disabled={isLoading}>
            Set
          </button>
        </form>
      </div>
    </div>
  );
};
