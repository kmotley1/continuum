import { BrowserView, BrowserWindow } from 'electron';
import { store } from './store';

export type ViewIds = 'logos' | 'ai';

export function createViews(win: BrowserWindow): Record<ViewIds, BrowserView> {
  const logos = new BrowserView({
    webPreferences: {
      contextIsolation: true,
      webSecurity: true,
      nodeIntegration: false,
    }
  });

  const ai = new BrowserView({
    webPreferences: {
      contextIsolation: true,
      webSecurity: true,
      nodeIntegration: false,
    }
  });

  win.addBrowserView(logos);
  win.addBrowserView(ai);

  // Load URLs from store or defaults
  const urls = store.get('urls', {
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

export function placeViews(
  win: BrowserWindow, 
  rects: { logos: Electron.Rectangle; ai: Electron.Rectangle; }
) {
  const browserViews = win.getBrowserViews();
  if (browserViews.length >= 2) {
    const [logos, ai] = browserViews;
    logos?.setBounds(rects.logos);
    ai?.setBounds(rects.ai);
  }
}