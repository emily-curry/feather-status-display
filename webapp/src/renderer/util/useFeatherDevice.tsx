import React, { useContext, useMemo } from 'react';

export interface FeatherContextControl {}

const FeatherContext = React.createContext<FeatherContextControl>(undefined!);

export const FeatherProvider: React.FC = (props) => {
  const control: FeatherContextControl = useMemo(() => {
    return {};
  }, []);

  return (
    <FeatherContext.Provider value={control}>
      {props.children}
    </FeatherContext.Provider>
  );
};

export const useFeatherControl = (): FeatherContextControl => {
  return useContext(FeatherContext);
};

export const useFeatherDevice = (): FeatherContextControl => {
  // TODO:
  return useContext(FeatherContext);
};
