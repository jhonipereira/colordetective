<div align="center">
  <img src="src/assets/logo.png" alt="ColorDetective Logo" width="128" height="128">

# ColorDetective

</div>

A powerful Chrome extension that helps you find and investigate all HTML elements on any webpage by their color properties. Simply input a color code (hex, RGB, HSL, or named colors) and discover every element using that color.

![ColorDetective](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Chrome](https://img.shields.io/badge/chrome-extension-yellow.svg)

## Features

- **Multi-format Color Search** - Search using hex (#FF5733), RGB (rgb(255, 87, 51)), HSL (hsl(14, 100%, 60%)), or 147 named colors
- **Comprehensive Property Detection** - Scans 14+ CSS color properties including shadows
- **Pseudo-element Support** - Detects colors in ::before and ::after pseudo-elements
- **Real-time DOM Scanning** - Instantly searches entire page DOM

- **Theme Support** - Light, Dark, and Auto (system-preference) themes
- **Search History** - Stores up to 10 recent searches per website with color swatches
- **Interactive Highlighting** - Click to highlight and scroll to element on page
- **Hover Preview** - Temporary highlight when hovering over results
- **One-click Copy** - Copy CSS selectors instantly
- **Keyboard Navigation** - Full keyboard support (arrows, Enter, Ctrl+C)
- **Accessibility** - Complete ARIA labels and screen reader support

### Advanced Options

- **Nested Element View** - Hierarchical display showing DOM relationships
- **Full Path Selectors** - Option to show complete CSS path from root
- **Auto-refresh** - Settings changes update results immediately

## Supported Color Properties

- **Text Colors**: `color`, `caret-color`
- **Background**: `background-color`
- **Borders**: `border-color`, `border-top-color`, `border-right-color`, `border-bottom-color`, `border-left-color`
- **Other**: `outline-color`, `text-decoration-color`
- **Shadows**: `box-shadow`, `text-shadow` (extracts embedded colors)
- **SVG**: `fill`, `stroke`
- **Pseudo-elements**: All above properties in `::before` and `::after`

## 🚀 Installation

### From Chrome Web Store

_(Coming soon)_

### Manual Installation (Development)

1. **Clone the repository:**

```bash
git clone https://github.com/jhonipereira/colordetective.git
cd colordetective
```

2. **Install dependencies:**

```bash
npm install
```

3. **Build the extension:**

```bash
npm run build
```

4. **Load in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist/` directory from this project

## Usage Guide

### Basic Search

1. Click the ColorDetective icon in your Chrome toolbar
2. Enter a color in any format:
   - Hex: `#FF5733` or `#F53`
   - RGB: `rgb(255, 87, 51)` or `rgba(255, 87, 51, 0.5)`
   - HSL: `hsl(14, 100%, 60%)`
   - Named: `red`, `coral`, `tomato`
3. Click "Search" or press Enter
4. View all matching elements with their properties

### Interacting with Results

- **Click** any result to highlight and scroll to the element on the page
- **Hover** over results for temporary highlight preview
- **Copy selector** using the 📋 button
- Use **keyboard arrows** to navigate results
- Press **Ctrl+C** to copy focused result's selector

### Settings

- **Theme**: Choose Light, Dark, or Auto
- **Show Nested Elements**: Toggle hierarchical view
- **Show Full Path**: Display complete CSS selector path

### Search History

- Recent searches appear when you focus the input field
- Click any history item to instantly search that color
- History is stored per-website
- Clear history with the "Clear" button

## 🛠️ Development

### Prerequisites

- Node.js v18 or higher
- npm v10 or higher

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

### Project Structure

```
colordetective/
├── src/
│   ├── popup/                  # Extension popup UI
│   │   ├── Popup.tsx          # Main React component (700+ lines)
│   │   ├── Popup.css          # Comprehensive styles with themes
│   │   └── index.tsx          # Entry point
│   ├── content/               # Content scripts (injected into pages)
│   │   ├── contentScript.ts   # Message handling & result aggregation
│   │   └── colorDetector.ts   # DOM scanning & color matching
│   ├── utils/                 # Shared utilities
│   │   ├── colorUtils.ts      # Color conversion & comparison (147 named colors)
│   │   └── types.ts           # TypeScript interfaces
│   └── assets/
│       └── icons/             # Extension icons (16, 48, 128px)
├── dist/                      # Production build output
├── manifest.json              # Chrome Extension Manifest V3
├── vite.config.ts            # Vite build configuration
├── vite.content.config.ts    # Content script build (IIFE format)
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies & scripts
```

### Architecture

1. **Popup (React)**: User interface for input, settings, and results display
2. **Content Script (Vanilla TS)**: Injected into pages to scan DOM and highlight elements
3. **Message Passing**: Chrome runtime messaging between popup and content script
4. **Storage**: chrome.storage.local for settings and search history

### Build System

The project uses two Vite configurations:

- **Main config**: Builds React popup as ES modules
- **Content config**: Builds content script as IIFE (required for Chrome content scripts)

Production build is optimized with:

- esbuild minification
- No source maps
- Consistent asset naming

## Bundle Sizes

- **Popup JS**: ~210KB (includes React)
- **Popup CSS**: ~6.5KB
- **Content Script**: ~10KB
- **Total gzipped**: ~70KB

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests and linting: `npm run lint && npm run type-check`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## Privacy

ColorDetective processes all data locally in your browser. **No data is ever sent to external servers.** The extension only:

- Reads DOM content of the active tab (to find colors)
- Stores settings and search history locally using chrome.storage.local
- Requires `activeTab` and `scripting` permissions for DOM access

## Known Limitations

- Gradient colors are not yet detected
- Alpha/opacity matching uses exact values (no tolerance)
- Very large DOMs (10,000+ elements) may have slight performance impact
- Dynamically loaded content after search won't be included (re-search required)

## Roadmap

- [ ] Color picker integration (To evaluate)
- [ ] Similar color matching with tolerance slider (To evaluate)
- [ ] Export results to JSON/CSV (To evaluate)
- [ ] Filter by element type (To evaluate)
- [ ] Gradient detection (To evaluate)
- [ ] Performance optimizations for large DOMs (continuous)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

**Jhoni S. Pereira**

- Email: npm@jhonipereira.com
- Website: https://jhonipereira.com/
- GitHub: [@jhonipereira](https://github.com/jhonipereira)

## Acknowledgments

- Built with React, TypeScript, and Vite
- Uses Chrome Extension Manifest V3
- Inspired by the need to quickly audit color usage on websites

---

**ColorDetective** - Find any color, anywhere on any webpage. 🎨🔍
