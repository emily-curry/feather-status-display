import React, { useState } from 'react';
import { useBattery } from './useBattery';

export const BatteryDisplay: React.FC<{ gatt: BluetoothRemoteGATTServer }> = ({
  gatt,
}) => {
  const battery = useBattery(gatt);

  return (
    <div className="flex-between">
      <div>Battery:</div>
      <div>{battery}</div>
    </div>
  );
};
