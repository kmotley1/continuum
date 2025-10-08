# Continuum Distribution Guide

## 🍎 Apple App Store (macOS)

### Prerequisites
1. **Apple Developer Account** ($99/year)
   - Sign up at [developer.apple.com](https://developer.apple.com)
   - Get your Team ID from the account

2. **Certificates & Provisioning**
   - Download Xcode
   - Create certificates in Keychain Access
   - Generate provisioning profiles

### Steps

#### 1. Update Configuration
Replace `YOUR_TEAM_ID` in `package.json` with your actual Apple Team ID.

#### 2. Set Environment Variables
```bash
export APPLE_ID="your-apple-id@example.com"
export APPLE_ID_PASSWORD="your-app-specific-password"
export APPLE_TEAM_ID="YOUR_TEAM_ID"
export CSC_LINK="path/to/your/certificate.p12"
export CSC_KEY_PASSWORD="certificate-password"
```

#### 3. Build for Distribution
```bash
# Install notarization dependencies
npm install --save-dev @electron/notarize

# Build and sign
npm run dist
```

#### 4. Upload to App Store
1. Use **Transporter** app or **Application Loader**
2. Upload the `.dmg` file from `release/` folder
3. Submit for review in App Store Connect

---

## 🪟 Microsoft Store (Windows)

### Prerequisites
1. **Microsoft Partner Center Account** ($19 one-time fee)
   - Sign up at [partner.microsoft.com](https://partner.microsoft.com)

2. **Code Signing Certificate**
   - Get from DigiCert, Sectigo, or GlobalSign
   - Or use Microsoft's free certificate for Store apps

### Steps

#### 1. Update Configuration
```json
"win": {
  "target": "appx",
  "publisherName": "CN=Your Company Name",
  "verifyUpdateCodeSignature": false
}
```

#### 2. Build for Microsoft Store
```bash
npm run dist
```

#### 3. Upload to Partner Center
1. Go to Partner Center
2. Create new app submission
3. Upload the `.appx` file

---

## 🛒 Direct Distribution (Both Platforms)

### macOS DMG Distribution
```bash
# Build unsigned version
npm run pack
```
- Distribute the `.dmg` from `release/` folder
- Users can install by dragging to Applications

### Windows NSIS Installer
```bash
# Build Windows installer
npm run dist
```
- Distribute the `.exe` installer from `release/` folder
- Users run installer to install the app

---

## 🔧 Additional Setup

### 1. Add App Icons
Create icon files and place them in `build/`:
- `icon.icns` (macOS)
- `icon.ico` (Windows)

### 2. Update App Metadata
Edit `package.json`:
```json
{
  "name": "continuum",
  "version": "1.0.0",
  "description": "Professional sermon study environment",
  "author": "Your Name <your-email@example.com>",
  "homepage": "https://your-website.com"
}
```

### 3. Privacy Policy & Terms
- Required for App Store submission
- Create privacy policy explaining data usage
- Add terms of service

### 4. App Store Assets
Create these for App Store Connect:
- App icon (1024x1024px)
- Screenshots (various sizes)
- App preview videos (optional)
- App description and keywords

---

## 🚀 Build Commands

```bash
# Development
npm run dev

# Build for testing
npm run pack

# Build for distribution
npm run dist

# Build specific platform
npx electron-builder --mac
npx electron-builder --win
npx electron-builder --linux
```

---

## 📋 Checklist Before Submission

### macOS App Store
- [ ] Apple Developer Account active
- [ ] Team ID configured
- [ ] Certificates installed
- [ ] App signed and notarized
- [ ] Privacy policy created
- [ ] App Store assets ready
- [ ] Test on multiple Mac devices

### Windows Store
- [ ] Microsoft Partner Center account
- [ ] App package built successfully
- [ ] Privacy policy created
- [ ] Store assets ready
- [ ] Test on multiple Windows devices

### General
- [ ] App thoroughly tested
- [ ] No console errors
- [ ] Proper error handling
- [ ] User documentation
- [ ] Support contact information

---

## 💡 Tips

1. **Testing**: Always test on clean machines before submission
2. **Versioning**: Use semantic versioning (1.0.0, 1.0.1, etc.)
3. **Updates**: Plan for automatic updates using electron-updater
4. **Analytics**: Consider adding crash reporting (Sentry, Bugsnag)
5. **Reviews**: Monitor user feedback and respond promptly

---

## 🆘 Troubleshooting

### Common Issues
- **Code signing errors**: Check certificates and passwords
- **Notarization fails**: Verify Apple ID credentials
- **Build fails**: Check file paths and dependencies
- **Store rejection**: Review Apple/Microsoft guidelines

### Resources
- [Electron Builder Documentation](https://www.electron.build/)
- [Apple App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Microsoft Store Policies](https://docs.microsoft.com/en-us/legal/windows/agreements/store-policies)



