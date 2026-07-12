import * as fabric from 'fabric';
// Note: In Vite, WASM modules often need to be dynamically imported or handled by plugins. 
// For @silvia-odwyer/photon, we can just import it. It will fetch the WASM automatically.
import * as photon from '@silvia-odwyer/photon';

export const applyWasmFilter = async (fabricImg: fabric.FabricImage, filterName: string, fabricCanvas: fabric.Canvas) => {
  try {
    // Get the underlying HTMLImageElement
    const imgElement = fabricImg.getElement() as HTMLImageElement;
    
    // Create a temporary canvas to run the WASM filter
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imgElement.width || fabricImg.width || 0;
    tempCanvas.height = imgElement.height || fabricImg.height || 0;
    const ctx = tempCanvas.getContext('2d');
    
    if (!ctx) return;
    
    // Draw the image to the temp canvas
    ctx.drawImage(imgElement, 0, 0, tempCanvas.width, tempCanvas.height);
    
    // Load image into photon
    const photonImg = photon.open_image(tempCanvas, ctx);
    
    // Apply filter
    photon.filter(photonImg, filterName);
    
    // Put data back to canvas
    photon.putImageData(tempCanvas, ctx, photonImg);
    
    // Cleanup photon image memory
    photonImg.free();
    
    // Update fabric image
    const dataUrl = tempCanvas.toDataURL('image/png');
    await fabricImg.setSrc(dataUrl);
    fabricCanvas.requestRenderAll();
  } catch (err) {
    console.error("Error applying WASM filter:", err);
  }
};
