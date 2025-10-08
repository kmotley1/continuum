"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createViews = createViews;
exports.placeViews = placeViews;
const electron_1 = require("electron");
const store_1 = require("./store");
function createViews(win) {
    const logos = new electron_1.BrowserView({
        webPreferences: {
            contextIsolation: true,
            webSecurity: true,
            nodeIntegration: false,
        }
    });
    const ai = new electron_1.BrowserView({
        webPreferences: {
            contextIsolation: true,
            webSecurity: true,
            nodeIntegration: false,
        }
    });
    win.addBrowserView(logos);
    win.addBrowserView(ai);
    // Load URLs from store or defaults
    const urls = store_1.store.get('urls', {
        logos: 'https://app.logos.com/',
        ai: 'https://chat.openai.com/'
    });
    logos.webContents.loadURL(urls.logos);
    ai.webContents.loadURL(urls.ai);
    // Handle navigation events
    logos.webContents.on('did-finish-load', () => {
        console.log('Logos view loaded');
    });
    ai.webContents.on('did-finish-load', () => {
        console.log('AI view loaded');
    });
    return { logos, ai };
}
function placeViews(win, rects) {
    const browserViews = win.getBrowserViews();
    if (browserViews.length >= 2) {
        const [logos, ai] = browserViews;
        logos?.setBounds(rects.logos);
        ai?.setBounds(rects.ai);
    }
}
