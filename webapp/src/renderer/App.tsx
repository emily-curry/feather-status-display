import React from 'react';
import './App.css';
import { DeviceManager } from './device-manager/DeviceManager';
import { FeatherProvider } from './util/useFeatherDevice';

const App: React.FC = () => {
  return (
    <FeatherProvider>
      <div className="App">
        <DeviceManager />
      </div>
    </FeatherProvider>
  );
};

export default App;
