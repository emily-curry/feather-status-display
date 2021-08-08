import React, { useCallback, useRef, useState } from 'react';
import { BluetoothDeviceState } from '../state';
import { StatusPicker } from '../status-picker/StatusPicker';
import { StatusCode } from '../util/statusCode';
import { useFeatherControl } from '../util/useFeatherDevice';
import './ImageWriter.css';
export const ImageWriter: React.FC = () => {
  const { state, writeImage } = useFeatherControl();
  return state?.device ? (
    <_ImageWriter
      device={state.device}
      isLoading={state.isLoading}
      writeImage={writeImage}
    />
  ) : (
    <></>
  );
};

const _ImageWriter: React.FC<{
  device: BluetoothDeviceState;
  isLoading: boolean;
  writeImage: (code: StatusCode, filePath: string) => Promise<void>;
}> = ({ device, isLoading, writeImage }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | undefined>();
  const [statusCode, setStatusCode] = useState<StatusCode | undefined>(
    undefined,
  );
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!file || statusCode === undefined) return;
    await writeImage(statusCode, file.path);
  }, [file, writeImage, statusCode]);

  const handleHelpClick = useCallback(() => {
    setShowHelp(!showHelp);
  }, [showHelp, setShowHelp]);

  const handleMapFileClick = useCallback(async () => {
    let a: HTMLAnchorElement | undefined;
    let url: string | undefined;
    try {
      const res = await fetch('/eink-4gray.png');
      const blob = await res.blob();
      a = document.createElement('a');
      url = URL.createObjectURL(blob);
      a.href = url;
      a.download = 'eink-4gray.png';
      document.body.append(a);
      a.click();
    } finally {
      if (url) URL.revokeObjectURL(url);
      if (a) document.body.removeChild(a);
    }
  }, []);

  return (
    <div>
      <h2>
        Image Writer <button onClick={handleHelpClick}>?</button>
      </h2>
      {showHelp && (
        <div id="image-writer-help">
          <input value={helpString} readOnly></input>
          <button onClick={handleMapFileClick}>map file</button>
        </div>
      )}
      <div id="image-writer-form">
        <div className="flex-between">
          <label>Status: </label>
          <StatusPicker
            disabled={isLoading}
            value={statusCode}
            onChange={setStatusCode}
          />
        </div>
        <div className="flex-between">
          <label>File: </label>
          <button onClick={() => fileInputRef?.current?.click()}>
            {file ? file.name : 'Choose'}
          </button>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isLoading || statusCode === undefined || file === undefined}
        >
          Update
        </button>
        <input
          ref={(el) => (fileInputRef.current = el)}
          type="file"
          disabled={isLoading}
          onChange={(e) => setFile(e.target?.files?.[0])}
        />
      </div>
    </div>
  );
};

const helpString =
  'convert input.bmp -dither FloydSteinberg -define dither:diffusion-amount=85% -remap eink-4gray.png -type truecolor BMP3:output.bmp';
