import { useState, useEffect, useMemo, useCallback } from 'react';
import { useGraphClient, useGraphClientToken } from '../util/useGraphClient';

interface MsSyncState {
  email: string;
}

export const useMsSync = () => {
  const graphClient = useGraphClient();
  const graphClientToken = useGraphClientToken();

  const [email, setEmail] = useState<string>();

  const loadMe = useCallback(async () => {
    const res = await graphClient.api('/me').get();
    setEmail(res.userPrincipalName);
  }, [graphClient, setEmail]);

  const hasToken = useMemo(() => !!graphClientToken, [graphClientToken]);

  return { email, loadMe, hasToken };
};
