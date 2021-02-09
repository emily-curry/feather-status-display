import { BLE_SERVICE_STATUS } from './constants.js';

/**
 * @param {number} uuid
 */
export const getServiceName = (uuid) => {
  switch (uuid) {
    case BLE_SERVICE_STATUS:
      return 'Status Service';
    default:
      return `Unknown [${uuid}]`;
  }
};

/**
 * @template T
 * @param {T | null | undefined} i
 * @returns {T}
 */
export const unwrap = (i) => {
  if (!i) throw new Error('Could not unwrap, value is null');
  return i;
};
