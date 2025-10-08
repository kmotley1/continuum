#!/bin/bash

# SermonStudio Launch Script
# This script launches the SermonStudio Electron app

PROJECT_DIR="/Users/kellymotley/Documents/CONTINUUM"

echo "🚀 Launching SermonStudio..."
echo "Project directory: $PROJECT_DIR"

# Navigate to project directory
cd "$PROJECT_DIR" || exit 1

# Set environment variable for production mode
export NODE_ENV=production

# Launch Electron app
echo "Starting Electron..."
npx electron .

echo "SermonStudio closed."

