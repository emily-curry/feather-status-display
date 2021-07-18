import { useCallback } from 'react';

export const useReadFile = () => {
  return useCallback((file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', (ev) => {
        const result = ev.target?.result ?? undefined;
        if (result) resolve(result as ArrayBuffer);
        else reject('bad result');
      });
      reader.addEventListener('error', (e) => reject(e));
      reader.readAsArrayBuffer(file);
    });
  }, []);
};
