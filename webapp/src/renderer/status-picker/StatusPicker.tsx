import React, { ChangeEvent, useCallback } from 'react';
import { StatusCode } from '../util/statusCode';

export const StatusPicker: React.FC<{
  value?: StatusCode;
  onChange?: (value?: StatusCode) => void;
  disabled?: boolean;
}> = ({ value, disabled, onChange }) => {
  const handleStatusChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      if (!onChange) return;
      const status = parseInt(e.target.value);
      if (!isNaN(status)) onChange(status as StatusCode);
      else onChange(undefined);
    },
    [onChange],
  );

  return (
    <select onChange={handleStatusChange} value={value} disabled={disabled}>
      <option value={undefined}>--</option>
      <option value={StatusCode.STATUS_UNKNOWN}>Unknown</option>
      <option value={StatusCode.STATUS_AVAILABLE}>Available</option>
      <option value={StatusCode.STATUS_OFFLINE}>Offline</option>
      <option value={StatusCode.STATUS_BUSY}>Busy</option>
      <option value={StatusCode.STATUS_DND}>Do Not Disturb</option>
      <option value={StatusCode.STATUS_MEETING}>In a Meeting</option>
      <option value={StatusCode.STATUS_BRB}>Be Right Back</option>
      <option value={StatusCode.STATUS_OOO}>Out of Office</option>
    </select>
  );
};
