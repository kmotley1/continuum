import { contextBridge, ipcRenderer } from 'electron';

export type ElectronAPI = {
  setupBrowserViews: () => Promise<void>;
  resizeBrowserViews: () => Promise<void>;
  updateLayout: (rects: { logos: Electron.Rectangle; ai: Electron.Rectangle; }) => Promise<void>;
  changeUrl: (viewId: 'logos' | 'ai', url: string) => Promise<{ success: boolean; error?: string }>;
  getSermons: () => Promise<any>;
  getAllSermons: () => Promise<any>;
  saveSermon: (sermon: any) => Promise<any>;
  getLayout: () => Promise<any>;
  saveLayout: (layout: any) => Promise<void>;
  triggerBridgeShortcut: (fromNotesEditor?: boolean) => Promise<{ success: boolean; message: string }>;
  getAiSelection: () => Promise<{ success: boolean; message?: string; text?: string }>;
  setLogosVisibility: (visible: boolean) => Promise<void>;
  getNotes: () => Promise<any>;
  getAllNotes: () => Promise<any>;
  saveNote: (note: any) => Promise<any>;
  deleteNote: (noteId: string) => Promise<any>;
  saveDialog: (options: any) => Promise<any>;
  writeFile: (filePath: string, content: string) => Promise<void>;
  printToPDF: (content: string, filePath: string) => Promise<void>;
  onBridgeToast: (callback: (data: { type: 'success' | 'error'; message: string }) => void) => void;
  onShowOnboarding: (callback: () => void) => void;
  onSelectionFromLogos: (callback: (data: { text: string; timestamp: string }) => void) => void;
};

const electronAPI: ElectronAPI = {
  setupBrowserViews: () => ipcRenderer.invoke('setup-browser-views'),
  resizeBrowserViews: () => ipcRenderer.invoke('resize-browser-views'),
  updateLayout: (rects) => ipcRenderer.invoke('update-layout', rects),
  changeUrl: (viewId, url) => ipcRenderer.invoke('change-url', viewId, url),
  getSermons: () => ipcRenderer.invoke('get-sermons'),
  getAllSermons: () => ipcRenderer.invoke('get-sermons'),
  saveSermon: (sermon) => ipcRenderer.invoke('save-sermon', sermon),
  getLayout: () => ipcRenderer.invoke('get-layout'),
  saveLayout: (layout) => ipcRenderer.invoke('save-layout', layout),
  triggerBridgeShortcut: (fromNotesEditor) => ipcRenderer.invoke('trigger-bridge-shortcut', fromNotesEditor),
  getAiSelection: () => ipcRenderer.invoke('get-ai-selection'),
  setLogosVisibility: (visible) => ipcRenderer.invoke('set-logos-visibility', visible),
  getNotes: () => ipcRenderer.invoke('get-notes'),
  getAllNotes: () => ipcRenderer.invoke('get-notes'),
  saveNote: (note) => ipcRenderer.invoke('save-note', note),
  deleteNote: (noteId) => ipcRenderer.invoke('delete-note', noteId),
  saveDialog: (options) => ipcRenderer.invoke('save-dialog', options),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  printToPDF: (content, filePath) => ipcRenderer.invoke('print-to-pdf', content, filePath),
  onBridgeToast: (callback) => ipcRenderer.on('bridge-toast', (_, data) => callback(data)),
  onShowOnboarding: (callback) => ipcRenderer.on('show-onboarding', callback),
  onSelectionFromLogos: (callback) => ipcRenderer.on('selection-from-logos', (_, data) => callback(data)),
};

contextBridge.exposeInMainWorld('api', electronAPI);

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
