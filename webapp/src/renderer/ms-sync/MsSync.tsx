import React, { useCallback } from 'react';
import { useGraphClientLogOut } from '../util/useGraphClient';
import { useMsSync } from './useMsSync';

export const MsSync: React.FC = () => {
  const logOut = useGraphClientLogOut();

  const onLogOut = useCallback(async () => {
    // TODO: Stop sync interval
    await logOut();
  }, [logOut]);

  const { hasToken, email, loadMe } = useMsSync();

  return (
    <div>
      <h2>MS Sync</h2>
      {!hasToken ? (
        <>
          <button onClick={loadMe}>log in</button>
        </>
      ) : (
        <>
          <div className="flex-between">
            <span>{email}</span>
            <button onClick={onLogOut}>log out</button>
          </div>
        </>
      )}
    </div>
  );
};
