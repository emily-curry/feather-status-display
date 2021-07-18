import React from 'react';
import './App.css';
import { DeviceManager } from './device-manager/DeviceManager';
import { ImageWriter } from './image-writer/ImageWriter';
import { StatusSwitch } from './status-switch/StatusSwitch';
import { FeatherProvider } from './util/useFeatherDevice';

const App: React.FC = () => {
  return (
    <FeatherProvider>
      <div className="App">
        <DeviceManager />
        <StatusSwitch />
        <ImageWriter />
      </div>
    </FeatherProvider>
  );
};

export default App;
