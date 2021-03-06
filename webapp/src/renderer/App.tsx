import React from 'react';
import './App.css';
import { DeviceManager } from './device-manager/DeviceManager';
import { ImageWriter } from './image-writer/ImageWriter';
import { MsSync } from './ms-sync/MsSync';
import { StatusSwitch } from './status-switch/StatusSwitch';
import { FeatherProvider } from './util/useFeatherDevice';
import { GraphClientProvider } from './util/useGraphClient';

const App: React.FC = () => {
  return (
    <GraphClientProvider>
      <FeatherProvider>
        <div className="App">
          <DeviceManager />
          <StatusSwitch />
          <ImageWriter />
          <MsSync />
        </div>
      </FeatherProvider>
    </GraphClientProvider>
  );
};

export default App;
