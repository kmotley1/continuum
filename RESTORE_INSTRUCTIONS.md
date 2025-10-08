# SermonStudio - Restore Instructions

## VERIFIED WORKING VERSION - Tag: WORKING-BACKUP-v1.0

This document explains how to restore the working version if anything breaks.

## What This Backup Contains

This is the VERIFIED WORKING VERSION extracted from `Continuum-Test.zip` (the original working backup app).

WHAT'S WORKING:
- All three panels (Sermon Planner, Logos, AI Workspace) functional
- Top banner with correct layout and all buttons
- Notes system with sidebar
- Calendar and planner features  
- BrowserViews positioned correctly
- Logos and ChatGPT loading properly
- Desktop shortcut created and working

## Quick Restore from GitHub

If you need to restore the working version:

```bash
# Navigate to project directory
cd /Users/kellymotley/Documents/CONTINUUM

# Reset to the working backup tag
git fetch origin
git checkout WORKING-BACKUP-v1.0

# Or restore to a new branch
git checkout -b restored-backup WORKING-BACKUP-v1.0
```

## Launch the App

There are two ways to launch SermonStudio:

### Method 1: Desktop Shortcut
Double-click the `SermonStudio.app` icon on your desktop

### Method 2: Terminal
```bash
cd /Users/kellymotley/Documents/CONTINUUM
NODE_ENV=production npx electron .
```

## Local Backup Files

The following files remain in your local directory (excluded from GitHub due to size):

- `Continuum.app/` - The complete working .app bundle extracted from the ZIP
- `extracted-source/` - The asar contents (already integrated into `dist/`)
- `archives/Continuum-Test.zip` - The original working backup ZIP file

These can be used for manual restoration if needed.

## Key Files in This Backup

- `dist/main/*` - Working compiled main process code
- `dist/renderer/*` - Working compiled renderer code  
- `launch-sermon-studio.sh` - Desktop shortcut launcher script
- `package.json` - Complete with all scripts and dependencies
- `vite.config.ts` - Fixed with correct root and outDir
- `src/renderer/index.html` - Required for Vite build
- `.gitignore` - Updated to exclude large app bundles

## Development Workflow

To make changes while keeping this backup safe:

```bash
# Create a new branch for development
git checkout -b feature/my-changes WORKING-BACKUP-v1.0

# Make your changes
# ... edit files ...

# Test your changes
npm run build
NODE_ENV=production npx electron .

# If something breaks, restore from backup
git checkout WORKING-BACKUP-v1.0
```

## Important Notes

- DO NOT delete the WORKING-BACKUP-v1.0 tag
- The `Continuum.app` and `extracted-source` folders are gitignored but remain locally
- Always test changes on a separate branch before modifying main
- The desktop shortcut points to this project directory

## Support

If you encounter issues:

1. First, try restoring from the Git tag (instructions above)
2. Check that `Continuum.app/` still exists locally  
3. Verify `archives/Continuum-Test.zip` is present
4. Re-extract from the ZIP if needed: `unzip -o archives/Continuum-Test.zip`

---

Last Updated: October 7, 2025
Version: 1.0.0 (WORKING-BACKUP-v1.0)

