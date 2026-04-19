# Export PNG Sequence — Photoshop Script

A Photoshop script that exports all layers as individual PNG files while preserving the full canvas size — no cropping, no manual workarounds.

## The Problem

A few versions ago Adobe changed the export behavior in Photoshop: when saving layers, PS now crops each one to its content and ignores the canvas dimensions. For Spine 2D animators this means every frame ends up a different size, which breaks the rig on import.

The common workaround — adding a full-canvas mask to every layer — works, but becomes tedious with sequences of 20, 30, or 40+ frames.

This script automates the whole thing in one click.

## Features

- Exports all layers as separate PNGs with the full canvas size preserved
- Optional trim-to-content mode (if you actually need it)
- Group support — choose to flatten groups or export each group as a single merged layer
- Custom filename prefix
- Custom export folder via dialog
- Automatic sequential numbering (`prefix_0001.png`, `prefix_0002.png`, ...)
- Error handling — if one layer fails, the rest still export

## Installation

1. Download `Export_PNG_NoTrim.jsx`
2. Place it anywhere on your computer
3. In Photoshop: **File → Scripts → Browse...** and select the file

Or place it in the Photoshop scripts folder to have it appear in the Scripts menu permanently:
- **Windows:** `C:\Program Files\Adobe\Adobe Photoshop [version]\Presets\Scripts\`
- **macOS:** `/Applications/Adobe Photoshop [version]/Presets/Scripts/`

Then restart Photoshop.

## Usage

1. Open your document in Photoshop
2. Run the script via **File → Scripts → Browse...** (or from the Scripts menu if installed)
3. Configure the options in the dialog window
4. Click **Export Layers**

## Dialog Fields

**Prefix**  
The filename prefix applied to all exported files. Default is `seq_`.  
Example: prefix `walk_` → `walk_0001.png`, `walk_0002.png`, ...  
Invalid characters (`/ \ : * ? " < > |`) are stripped automatically.

**Trim transparent edges (crop to content)**  
When unchecked (default) — each PNG is saved at the full canvas size, regardless of layer content. This is the main purpose of the script and what you want for Spine.  
When checked — each layer is cropped to its non-transparent pixels before saving. Use this only if you specifically need trimmed frames.

**Flatten groups (export each layer inside)**  
When checked (default) — the script recursively enters all layer groups and exports each individual layer inside them.  
When unchecked — each group is exported as a single merged PNG without entering it.

**No folder selected / Choose Folder**  
Click **Choose Folder** to select where the PNG files will be saved. The selected path is shown next to the button. Export won't start until a folder is chosen.

**Cancel**  
Closes the dialog without exporting anything.

**Export Layers**  
Starts the export. A summary dialog will appear when done, showing how many files were saved and listing any errors if they occurred.

## Compatibility

Tested on Photoshop CC 2022–2025. Should work on any version that supports ExtendScript (`.jsx`).

## Author

**Oleksii Chervoniuk** — 2D Spine Animator  
[LinkedIn](https://www.linkedin.com/in/oleksii-chervoniuk/)

## License

MIT — free to use, modify, and distribute.
