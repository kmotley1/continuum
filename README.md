# SermonStudio - Professional Sermon Preparation

A powerful Electron-based desktop application designed for sermon preparation and Bible study, featuring integrated access to Logos Bible Software and ChatGPT in a unified 3-panel workspace.

## Overview

Continuum provides pastors and Bible teachers with a streamlined environment for sermon preparation, combining:

- **Sermon Planner**: Calendar-based sermon planning with note-taking capabilities
- **Logos Bible Software**: Integrated Bible study tools and resources
- **AI Workspace**: ChatGPT integration for research and content assistance
- **Notes System**: Rich text editor with search and organization features

## Features

### Core Functionality
- **3-Panel Layout**: Simultaneous access to planning, Bible study, and AI assistance
- **Calendar Integration**: Visual sermon planning with date-based organization
- **BrowserView Integration**: Seamless embedding of Logos and ChatGPT
- **Global Shortcuts**: Quick access to bridge content between panels
- **Persistent Storage**: Automatic saving of layouts, notes, and preferences
- **Cross-Platform**: Built with Electron for macOS and Windows compatibility

### Technical Features
- **TypeScript**: Full type safety throughout the application
- **React Frontend**: Modern UI with Tailwind CSS styling
- **Electron IPC**: Secure communication between main and renderer processes
- **Vite Build System**: Fast development and optimized production builds
- **Auto-updater Ready**: Built-in support for application updates

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Logos Bible Software account (for full functionality)
- ChatGPT account (for AI workspace)

### Installation & Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sermon-studio.git
   cd sermon-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   npm run electron
   ```

## Project Structure

```
sermon-studio/
├── src/                          # Source code
│   ├── main/                     # Electron main process
│   │   ├── main.ts              # App lifecycle & window management
│   │   ├── preload.ts           # IPC bridge setup
│   │   ├── shortcuts.ts         # Global keyboard shortcuts
│   │   ├── store.ts             # Persistent data storage
│   │   └── views.ts             # BrowserView management
│   └── renderer/                # React frontend
│       ├── App.tsx              # Root React component
│       ├── index.tsx            # React entry point
│       ├── index.css            # Global styles
│       ├── components/          # React components
│       │   ├── ColumnHeader.tsx # Panel headers
│       │   ├── Onboarding.tsx   # First-time user experience
│       │   ├── Planner.tsx      # Sermon planning calendar
│       │   ├── SettingsModal.tsx # Application settings
│       │   ├── SplitLayout.tsx  # Main 3-panel layout
│       │   └── Toast.tsx        # Notification system
│       └── types/               # TypeScript definitions
├── docs/                        # Documentation
├── archives/                    # Backup files
│   └── Continuum-Test.zip       # Working backup version
├── build/                       # Build configuration
├── scripts/                     # Build & deployment scripts
├── dist/                        # Compiled output (auto-generated)
├── release/                     # Distribution builds (auto-generated)
└── [config files]              # package.json, tsconfig.json, etc.
```

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:vite` - Build React frontend only
- `npm run build:electron` - Compile TypeScript main process
- `npm run electron` - Run built Electron app
- `npm run package` - Create distribution packages

### Key Components

#### Main Process (`src/main/`)
- **main.ts**: Creates Electron window, handles app lifecycle, manages IPC
- **views.ts**: Manages BrowserViews for Logos and ChatGPT integration
- **preload.ts**: Secure IPC bridge between main and renderer processes
- **store.ts**: Persistent storage using electron-store
- **shortcuts.ts**: Global keyboard shortcuts for productivity

#### Renderer Process (`src/renderer/`)
- **SplitLayout.tsx**: Core 3-panel layout component
- **Planner.tsx**: Calendar-based sermon planning interface
- **Onboarding.tsx**: First-time user setup and introduction
- **SettingsModal.tsx**: Application configuration and preferences

### BrowserView Integration

The app uses Electron's BrowserView to embed:
- **Logos Bible Software**: `https://app.logos.com/`
- **ChatGPT**: `https://chat.openai.com/` or `https://chatgpt.com/`

BrowserViews are positioned and resized dynamically based on panel layout changes.

## Distribution

### Building Distribution Packages

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Package for distribution**
   ```bash
   npm run package
   ```

### Supported Platforms
- **macOS**: Universal binary (Intel + Apple Silicon)
- **Windows**: x64 installer
- **Linux**: AppImage (planned)

## Configuration

### Environment Variables
- `NODE_ENV`: Set to 'development' or 'production'
- `ELECTRON_IS_DEV`: Automatically set during development

### User Preferences
User preferences are stored in:
- **macOS**: `~/Library/Application Support/continuum/`
- **Windows**: `%APPDATA%/continuum/`

## Troubleshooting

### Common Issues

1. **BrowserViews not loading**
   - Check internet connection
   - Verify Logos/ChatGPT URLs are accessible
   - Clear application data and restart

2. **Layout issues**
   - Reset layout in Settings
   - Clear stored preferences
   - Restart application

3. **Global shortcuts not working**
   - Check system permissions
   - Verify no conflicts with other applications
   - Restart application

### Recovery Options

If the application becomes unstable:
1. **Use the backup**: Extract `archives/Continuum-Test.zip`
2. **Clear application data**: Delete user preferences folder
3. **Reset to defaults**: Delete all stored data and restart

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain consistent code formatting
- Add tests for new features
- Update documentation as needed

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Logos Bible Software** for providing the Bible study platform
- **OpenAI** for ChatGPT integration
- **Electron** for the cross-platform desktop framework
- **React** and **TypeScript** communities for excellent tooling

## Support

For support, feature requests, or bug reports:
- Open an issue on GitHub
- Check the documentation in the `docs/` folder
- Review the troubleshooting section above

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Status**: Active Development