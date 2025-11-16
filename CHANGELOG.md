# Changelog

All notable changes to ColorDetective will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-16

### Added

- **Core Features**

  - Multi-format color input support (hex, RGB, RGBA, HSL, HSLA, named colors)
  - DOM scanning for 14 CSS color properties
  - Pseudo-element detection (::before, ::after)
  - Interactive highlighting on click with scroll-to-element
  - Hover preview for temporary highlighting

- **User Interface**

  - Clean, modern popup interface
  - Light, Dark, and Auto theme support
  - Search history with color swatches (up to 10 per website)
  - One-click selector copying with visual feedback
  - Results count display
  - Empty state handling
  - Clear/reset functionality

- **Advanced Options**

  - Nested element view showing DOM hierarchy
  - Full path selector option (html > body > div...)
  - Depth indicators for nested results
  - Auto-refresh on settings change

- **Accessibility**

  - Full keyboard navigation (Arrow keys, Home, End, Enter)
  - Ctrl+C shortcut to copy selector
  - Complete ARIA labels and roles
  - Screen reader support
  - Focus management

- **Technical**
  - Chrome Extension Manifest V3
  - React + TypeScript + Vite build system
  - Separate IIFE build for content scripts
  - chrome.storage.local for persistent settings
  - Message passing architecture

### Supported Color Properties

- `color`
- `background-color`
- `border-color` (and directional variants)
- `outline-color`
- `text-decoration-color`
- `caret-color`
- `box-shadow` (color extraction)
- `text-shadow` (color extraction)
- `fill` (SVG)
- `stroke` (SVG)

### Color Formats Supported

- Hex: `#RGB`, `#RRGGBB`
- RGB: `rgb(r, g, b)`
- RGBA: `rgba(r, g, b, a)`
- HSL: `hsl(h, s%, l%)`
- HSLA: `hsla(h, s%, l%, a)`
- Named colors: 147 CSS named colors (red, coral, aliceblue, etc.)

## [0.1.0] - 2025-11-15

### Added

- Initial project setup
- Basic extension structure
- Vite build configuration
- TypeScript configuration
- ESLint setup

---
