import { imagePanel } from './image-panel.js';
import { unwrap } from './util.js';

class ImagePanelUI {
  #imageSet = false;
  #codeSet = false;

  #filePicker = document.getElementById('image-data-input');
  get filePicker() {
    return unwrap(this.#filePicker);
  }
  #codeInput = document.getElementById('image-status-code-input');
  get codeInput() {
    return unwrap(this.#codeInput);
  }
  #writeButton = document.getElementById('image-status-code-button');
  get writeButton() {
    return unwrap(this.#writeButton);
  }

  init() {
    this.filePicker.addEventListener('change', this.#onImage);
    this.codeInput.addEventListener('change', this.#onCode);
    this.writeButton.addEventListener('click', this.#onSubmit);
  }

  /**
   *
   * @param {Event} ev
   */
  #onCode = (ev) => {
    // @ts-ignore
    const code = parseInt(this.codeInput.value);
    imagePanel.onCode(code);
    this.#codeSet = !isNaN(code);
    this.#setButtonState();
  };

  /**
   * @param {Event} ev
   */
  #onImage = (ev) => {
    // @ts-ignore
    const img = ev.target?.files?.[0];
    imagePanel.onImage(img);
    this.#imageSet = !!img;
    this.#setButtonState();
  };

  #onSubmit = imagePanel.submit;

  #setButtonState = () => {
    const disabled = !this.#imageSet || !this.#codeSet;
    // @ts-ignore
    this.writeButton.disabled = disabled;
  };
}

export const imagePanelUI = new ImagePanelUI();
