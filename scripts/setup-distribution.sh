#!/bin/bash

echo "🚀 Continuum Distribution Setup"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the Continuum root directory"
    exit 1
fi

echo "📋 Distribution Checklist:"
echo ""
echo "🍎 For Apple App Store:"
echo "  1. Get Apple Developer Account (\$99/year)"
echo "  2. Get your Team ID from developer.apple.com"
echo "  3. Replace 'YOUR_TEAM_ID' in package.json"
echo "  4. Set environment variables:"
echo "     export APPLE_ID='your-apple-id@example.com'"
echo "     export APPLE_ID_PASSWORD='your-app-specific-password'"
echo "     export APPLE_TEAM_ID='YOUR_TEAM_ID'"
echo ""
echo "🪟 For Microsoft Store:"
echo "  1. Get Microsoft Partner Center Account (\$19 one-time)"
echo "  2. Update win.target to 'appx' in package.json"
echo "  3. Upload to Partner Center"
echo ""
echo "🛒 For Direct Distribution:"
echo "  Run: npm run dist"
echo "  Files will be in the 'release/' folder"
echo ""
echo "📚 Full guide: See DISTRIBUTION_GUIDE.md"
echo ""
echo "✅ Ready to build? Run: npm run dist"



