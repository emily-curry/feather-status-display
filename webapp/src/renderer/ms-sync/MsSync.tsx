import React from 'react';
import { useGraphClient } from '../util/useGraphClient';

export const MsSync: React.FC = () => {
  const { logOut } = useGraphClient();

  return (
    <div>
      <h2>MS Sync</h2>
      <div className="flex-between">
        <span>TODO: Email</span>
        <button onClick={logOut}>log out</button>
      </div>
    </div>
  );
};
