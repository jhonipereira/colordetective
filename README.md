# ColorDetective 🎨

A Chrome extension that allows you to input a color hex code and searches the entire webpage to list all HTML elements containing that color.

## Features

- 🔍 Search for elements by hex color code
- 📋 Display all matching elements with their CSS selectors
- 🎯 Show which color property matches (color, background-color, border-color)
- ⚡ Real-time DOM scanning
- 🎨 Support for both 3-digit and 6-digit hex codes

## Development Setup

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (v10 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jhonipereira/colordetective.git
cd colordetective
```

2. Install dependencies:
```bash
npm install
```

### Development

Run the development server:
```bash
npm run dev
```

This will start Vite in development mode. Changes will be reflected automatically.

### Building

Build the extension for production:
```bash
npm run build
```

The built extension will be in the `dist/` directory.

### Type Checking

Run TypeScript type checking:
```bash
npm run type-check
```

### Linting

Run ESLint:
```bash
npm run lint
```

## Loading the Extension in Chrome

1. Build the extension using `npm run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `dist/` directory from this project

## Project Structure

```
colordetective/
├── src/
│   ├── popup/              # Extension popup UI
│   │   ├── Popup.tsx       # Main popup component
│   │   ├── Popup.css       # Popup styles
│   │   └── index.tsx       # Popup entry point
│   ├── content/            # Content scripts
│   │   ├── contentScript.ts   # Message listener
│   │   └── colorDetector.ts   # Color detection logic
│   ├── components/         # Shared React components (future)
│   ├── utils/              # Utility functions
│   │   ├── colorUtils.ts   # Color conversion & comparison
│   │   └── types.ts        # TypeScript type definitions
│   └── assets/             # Static assets
├── public/                 # Public assets
│   └── icons/             # Extension icons
├── dist/                   # Build output (gitignored)
├── manifest.json          # Chrome extension manifest
├── index.html            # Popup HTML
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies
```

## How It Works

1. **Popup UI**: The extension popup provides an input field for hex color codes
2. **Message Passing**: When searching, the popup sends a message to the content script
3. **DOM Scanning**: The content script scans all DOM elements and their computed styles
4. **Color Matching**: Each element's color properties are compared against the search color
5. **Results Display**: Matching elements are returned with their selectors and displayed in the popup

## Technologies Used

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Chrome Extension API** - Browser extension functionality

## Current Limitations

- Only supports hex color codes (no RGB, HSL, or named colors yet)
- Doesn't scan pseudo-elements (::before, ::after)
- Doesn't scan SVG fill/stroke colors yet

## Roadmap

See [local-md/TODO.md](local-md/TODO.md) for the complete project roadmap.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

Jhoni S. Pereira
- Email: npm@jhonipereira.com
- Website: https://jhonipereira.com/
- GitHub: https://github.com/jhonipereira

## Acknowledgments

Built with modern web technologies and Chrome Extension Manifest V3
