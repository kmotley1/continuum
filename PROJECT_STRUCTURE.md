# SermonStudio Project Structure

## Overview
This is an Electron-based sermon study application with React frontend and TypeScript.

## Directory Structure

```
SERMONSTUDIO/
├── src/                          # Source code
│   ├── main/                     # Electron main process
│   │   ├── main.ts              # Main process entry point
│   │   ├── preload.ts           # Preload script for IPC
│   │   ├── shortcuts.ts         # Global keyboard shortcuts
│   │   ├── store.ts             # Electron store for persistence
│   │   └── views.ts             # BrowserView management
│   └── renderer/                # React frontend
│       ├── App.tsx              # Main React component
│       ├── index.tsx            # React entry point
│       ├── index.css            # Global styles
│       ├── components/          # React components
│       │   ├── ColumnHeader.tsx
│       │   ├── Onboarding.tsx
│       │   ├── Planner.tsx
│       │   ├── SettingsModal.tsx
│       │   ├── SplitLayout.tsx  # Main 3-panel layout
│       │   └── Toast.tsx
│       └── types/               # TypeScript type definitions
├── docs/                        # Documentation
│   ├── DISTRIBUTION_GUIDE.md
│   ├── WINDOWS_DISTRIBUTION_GUIDE.txt
│   └── ...other guides...
├── archives/                    # Backup and archive files
│   └── Continuum-Test.zip       # Working backup
├── build/                       # Build configuration
│   ├── entitlements.mac.plist
│   └── notarize.js
├── scripts/                     # Build and deployment scripts
├── dist/                        # Compiled output (auto-generated)
├── release/                     # Distribution builds (auto-generated)
├── node_modules/                # Dependencies (auto-generated)
├── package.json                 # Project configuration
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite build configuration
└── tailwind.config.js          # Tailwind CSS configuration
```

## Key Files

### Main Process (`src/main/`)
- **main.ts**: Creates Electron window, handles app lifecycle
- **views.ts**: Manages BrowserViews for Logos and ChatGPT
- **preload.ts**: Exposes IPC methods to renderer
- **store.ts**: Persistent data storage
- **shortcuts.ts**: Global keyboard shortcuts

### Renderer (`src/renderer/`)
- **App.tsx**: Root React component
- **SplitLayout.tsx**: Main 3-panel UI layout
- **Planner.tsx**: Sermon planning calendar
- **Onboarding.tsx**: First-time user experience

## Development Workflow

1. **Development**: `npm run dev` (starts Vite dev server + Electron)
2. **Build**: `npm run build` (compiles TypeScript + builds React)
3. **Production**: `NODE_ENV=production npx electron .`

## Build Outputs

- **dist/**: Compiled JavaScript and built React app
- **release/**: Packaged Electron apps for distribution
- **archives/**: Backup files and working versions

## Notes

- The `archives/` folder contains the working backup (`Continuum-Test.zip`)
- Build artifacts in `dist/` and `release/` are auto-generated and should not be edited
- Documentation is organized in the `docs/` folder
- The app uses BrowserViews to embed Logos Bible Software and ChatGPT
