import React, { useMemo } from 'react';

export const BatteryDisplay: React.FC<{ battery?: number }> = ({ battery }) => {
  const batteryString = useMemo(() => {
    if (battery === undefined) return '--';
    return battery.toString().padStart(2, '0');
  }, [battery]);

  return (
    <div className="flex-between">
      <div>Battery:</div>
      <div>{batteryString}%</div>
    </div>
  );
};
