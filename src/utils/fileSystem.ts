/**
 * Utility functions for wrapping the Chrome File System Access API
 * Includes fallbacks for unsupported browsers.
 */

const pickerOptions = {
  types: [
    {
      description: 'CanvaWasm Project',
      accept: { 'application/json': ['.json'] },
    },
  ],
};

/**
 * Open a file and return its parsed JSON content along with the file handle (if supported).
 */
export const openProjectFile = async (): Promise<{ handle: any; name: string; content: any }> => {
  if ('showOpenFilePicker' in window) {
    try {
      const [handle] = await (window as any).showOpenFilePicker(pickerOptions);
      const file = await handle.getFile();
      const text = await file.text();
      return { handle, name: file.name.replace(/\.json$/, ''), content: JSON.parse(text) };
    } catch (e: any) {
      if (e.name !== 'AbortError') throw e;
      throw new Error('Cancelled');
    }
  } else {
    // Fallback for browsers without File System Access API
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (!file) {
          reject(new Error('Cancelled'));
          return;
        }
        const reader = new FileReader();
        reader.onload = (re) => {
          try {
            resolve({ handle: null, name: file.name.replace(/\.json$/, ''), content: JSON.parse(re.target?.result as string) });
          } catch (err) {
            reject(err);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    });
  }
};

/**
 * Save data to an existing file handle.
 * If the API is not supported or handle is null, triggers a fallback download.
 */
export const saveProjectFile = async (handle: any, data: any, fallbackName: string): Promise<any> => {
  const jsonStr = JSON.stringify(data, null, 2);
  
  if ('showSaveFilePicker' in window && handle) {
    try {
      const writable = await (handle as any).createWritable();
      await writable.write(jsonStr);
      await writable.close();
      return handle;
    } catch (e: any) {
      console.warn('Failed to save to handle, falling back...', e);
    }
  }
  
  // Fallback download
  triggerDownload(jsonStr, fallbackName);
  return null;
};

/**
 * Show a "Save As" dialog to save a new file.
 */
export const saveAsProjectFile = async (data: any, defaultName: string): Promise<{ handle: any; name: string }> => {
  const jsonStr = JSON.stringify(data, null, 2);
  
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        ...pickerOptions,
        suggestedName: `${defaultName}.json`,
      });
      const writable = await handle.createWritable();
      await writable.write(jsonStr);
      await writable.close();
      return { handle, name: handle.name.replace(/\.json$/, '') };
    } catch (e: any) {
      if (e.name !== 'AbortError') throw e;
      throw new Error('Cancelled');
    }
  } else {
    // Fallback
    triggerDownload(jsonStr, defaultName);
    return { handle: null, name: defaultName };
  }
};

const triggerDownload = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
