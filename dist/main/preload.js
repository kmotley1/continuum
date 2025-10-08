"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electronAPI = {
    updateLayout: (rects) => electron_1.ipcRenderer.invoke('update-layout', rects),
    changeUrl: (viewId, url) => electron_1.ipcRenderer.invoke('change-url', viewId, url),
    getSermons: () => electron_1.ipcRenderer.invoke('get-sermons'),
    saveSermon: (sermon) => electron_1.ipcRenderer.invoke('save-sermon', sermon),
    getLayout: () => electron_1.ipcRenderer.invoke('get-layout'),
    saveLayout: (layout) => electron_1.ipcRenderer.invoke('save-layout', layout),
    triggerBridgeShortcut: (fromNotesEditor) => electron_1.ipcRenderer.invoke('trigger-bridge-shortcut', fromNotesEditor),
    getAiSelection: () => electron_1.ipcRenderer.invoke('get-ai-selection'),
    setLogosVisibility: (visible) => electron_1.ipcRenderer.invoke('set-logos-visibility', visible),
    getNotes: () => electron_1.ipcRenderer.invoke('get-notes'),
    saveNote: (note) => electron_1.ipcRenderer.invoke('save-note', note),
    deleteNote: (noteId) => electron_1.ipcRenderer.invoke('delete-note', noteId),
    saveDialog: (options) => electron_1.ipcRenderer.invoke('save-dialog', options),
    writeFile: (filePath, content) => electron_1.ipcRenderer.invoke('write-file', filePath, content),
    printToPDF: (content, filePath) => electron_1.ipcRenderer.invoke('print-to-pdf', content, filePath),
    onBridgeToast: (callback) => electron_1.ipcRenderer.on('bridge-toast', (_, data) => callback(data)),
    onShowOnboarding: (callback) => electron_1.ipcRenderer.on('show-onboarding', callback),
    onSelectionFromLogos: (callback) => electron_1.ipcRenderer.on('selection-from-logos', (_, data) => callback(data)),
};
electron_1.contextBridge.exposeInMainWorld('api', electronAPI);
