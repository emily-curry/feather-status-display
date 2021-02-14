import {
  UUID16_CHR_IMAGE_CONTROL,
  UUID16_CHR_IMAGE_WRITER,
  UUID16_SVC_IMAGE,
} from './constants.js';
import { deviceManager } from './device-manager.js';

class ImagePanel {
  /** @type {ArrayBuffer | undefined} */
  #imageData = undefined;
  /** @type {number | undefined} */
  #code = undefined;

  init() {}

  /**
   *
   * @param {number} code
   */
  onCode = (code) => {
    if (isNaN(code)) {
      this.#code = undefined;
    } else {
      this.#code = code;
    }
  };

  /**
   * @param {File} file
   */
  onImage = (file) => {
    console.log('file received', file);
    if (!file) {
      this.#imageData = undefined;
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', (ev) => {
      // @ts-ignore
      this.#imageData = ev.target?.result ?? undefined;
    });
    reader.readAsArrayBuffer(file);
  };

  submit = async () => {
    console.log('writing image...');
    const imageService = await (
      await deviceManager.getGATTServer()
    ).getPrimaryService(UUID16_SVC_IMAGE);
    console.log('got image service');
    const controlChr = await imageService.getCharacteristic(
      UUID16_CHR_IMAGE_CONTROL,
    );
    console.log('got control char');
    if (!this.#code) throw new Error('code is undefined');
    try {
      await controlChr.writeValueWithResponse(new Uint8Array([1, this.#code]));
      const writerChr = await imageService.getCharacteristic(
        UUID16_CHR_IMAGE_WRITER,
      );
      console.log('got writer char');
      if (!this.#imageData) throw new Error('image data is undefined');
      for (let offset = 0; offset < this.#imageData.byteLength; offset += 508) {
        console.log('writing image chunk at offset', offset);
        const offsetArray = new Uint32Array([offset]);
        const view = new Uint8Array(
          this.#imageData.slice(
            offset,
            Math.min(offset + 508, this.#imageData.byteLength),
          ),
        );
        const data = new Uint8Array(offsetArray.byteLength + view.byteLength);
        data.set(new Uint8Array(offsetArray.buffer), 0);
        data.set(view, offsetArray.byteLength);
        await writerChr.writeValueWithResponse(data);
      }
      console.log('writing image success!');
    } finally {
      await controlChr.writeValueWithResponse(new Uint8Array([2]));
      console.log('writing image complete');
    }
  };
}

export const imagePanel = new ImagePanel();
