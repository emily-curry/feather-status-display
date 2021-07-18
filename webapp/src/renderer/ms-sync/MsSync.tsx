import React, { useCallback } from 'react';
import { useGraphClient, useGraphClientLogOut } from '../util/useGraphClient';

export const MsSync: React.FC = () => {
  const client = useGraphClient();
  const logOut = useGraphClientLogOut();

  const handleClick = useCallback(async () => {
    const res = await client.api('/me').get();
    console.log(res);
  }, [client]);

  return (
    <div>
      <h2>MS Sync</h2>
      <button onClick={handleClick}>log info</button>
      <button onClick={logOut}>log out</button>
    </div>
  );
};
