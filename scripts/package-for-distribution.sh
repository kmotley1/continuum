#!/bin/bash

echo "📦 Packaging Continuum for Distribution"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the Continuum root directory"
    exit 1
fi

# Create distribution folder
mkdir -p distribution

echo "📋 Available builds:"
echo ""

# Check for Windows build
if [ -f "release/Continuum Setup 1.0.0.exe" ]; then
    echo "✅ Windows build found: $(ls -lh 'release/Continuum Setup 1.0.0.exe' | awk '{print $5}')"
    cp "release/Continuum Setup 1.0.0.exe" "distribution/"
else
    echo "❌ Windows build not found. Run: npm run dist -- --win"
fi

# Check for macOS build
if [ -d "release/mac-arm64/Continuum.app" ]; then
    echo "✅ macOS build found: $(du -sh 'release/mac-arm64/Continuum.app' | awk '{print $1}')"
    cd release/mac-arm64
    zip -r "../../distribution/Continuum-Test.zip" Continuum.app
    cd ../..
else
    echo "❌ macOS build not found. Run: npm run pack"
fi

echo ""
echo "📁 Distribution folder contents:"
ls -lh distribution/

echo ""
echo "🚀 Ready to distribute!"
echo ""
echo "Upload these files to:"
echo "- Google Drive/Dropbox (share link)"
echo "- WeTransfer (wetransfer.com)"
echo "- Or copy to USB drive"
echo ""
echo "Send the email content from: EMAIL_TO_PASTOR.txt"
