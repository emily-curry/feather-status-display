import React, { useCallback } from 'react';
import { useGraphClient } from '../util/useGraphClient';

export const MsSync: React.FC = () => {
  const { logOut } = useGraphClient();

  const onLogOut = useCallback(async () => {
    // TODO: Stop sync interval
    await logOut();
  }, [logOut]);

  return (
    <div>
      <div className="flex-between">
        <span>TODO: Email</span>
        <button onClick={onLogOut}>log out</button>
      </div>
    </div>
  );
};
