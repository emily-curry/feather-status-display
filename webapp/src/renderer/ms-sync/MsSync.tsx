import React from 'react';
import { useGraphClient } from '../util/useGraphClient';

export const MsSync: React.FC = () => {
  const { logOut, logIn, state } = useGraphClient();

  return (
    <div>
      <h2>MS Sync</h2>
      {state.me ? (
        <div className="flex-between">
          <span>{state.me.email}</span>
          <button onClick={logOut} disabled={state.isLoading}>
            log out
          </button>
        </div>
      ) : (
        <div className="flex-between">
          <span>Unauthenticated</span>
          <button onClick={logIn} disabled={state.isLoading}>
            log in
          </button>
        </div>
      )}
      {state.activity && (
        <div className="flex-between">
          <span>Teams Status</span>
          <span>{state.activity.current}</span>
        </div>
      )}
    </div>
  );
};
