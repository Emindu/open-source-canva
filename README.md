# CanvaWasm

CanvaWasm is a client-side, highly performant web application for designing graphics and editing photos, heavily inspired by Canva. It leverages modern web technologies and WebAssembly (WASM) to deliver desktop-class performance directly in the browser, without requiring backend processing.

## 🚀 Features

- **Drag-and-Drop Canvas Editor**: Built on top of `fabric.js`, allowing you to add, move, scale, and rotate objects with ease.
- **Rich Text & Shapes**: Add customizable text (font family, size, color) and shapes (rectangles, circles). Text automatically wraps and scales.
- **WebAssembly Image Processing**: Upload local images and apply high-performance, purely client-side filters (like Oceanic and Radio) using the `@silvia-odwyer/photon` WASM library.
- **Dynamic Property Editor**: The top toolbar dynamically changes based on the object selected, giving you instant access to styling controls and deletion.
- **Premium UI**: Clean, responsive, and intuitive interface styled with custom Vanilla CSS variables for maximum flexibility.
- **State Management**: Robust global state management handled by Zustand.

## 🛠️ Technology Stack

- **Framework**: React 18 (via Vite)
- **Language**: TypeScript
- **Canvas Engine**: Fabric.js (v6)
- **State Management**: Zustand
- **WebAssembly Library**: Photon (Rust-compiled WASM for image processing)
- **Styling**: Vanilla CSS

## ⚙️ Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository or navigate to the project directory:
   ```bash
   cd "Photo editor"
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

## 🎮 How to Use

- **Adding Elements**: Use the left Sidebar to add Rectangles, Circles, or Text to the canvas.
- **Editing Elements**: Click on an element on the canvas to select it. The Topbar will update with relevant controls (e.g., Font Size, Color).
- **Deleting Elements**: Select an element and press the `Delete` or `Backspace` key on your keyboard, or click the red `Delete` button in the Topbar.
- **Using WebAssembly Filters**: 
  1. Click **Upload Image** in the Sidebar to load an image from your computer.
  2. Click the image on the canvas to select it.
  3. Click one of the **WASM** filter buttons in the Topbar to apply instant, client-side image processing!

## 🚧 Roadmap (Future Enhancements)

- Video editing support via `ffmpeg.wasm`.
- Comprehensive Template Library.
- Undo / Redo functionality.
- Export options (JPEG, PNG, PDF, MP4).
- Z-index layer management.
