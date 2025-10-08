"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const views_1 = require("./views");
const shortcuts_1 = require("./shortcuts");
const store_1 = require("./store");
const fs = __importStar(require("fs"));
let mainWindow;
let views;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: __dirname + '/preload.js',
        },
        titleBarStyle: 'hiddenInset',
        show: false,
        title: 'Continuum - Sermon Study Environment',
    });
    // Load the React app
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
    }
    else {
        mainWindow.loadFile('dist/renderer/index.html');
    }
    // Create BrowserViews for Logos and AI
    views = (0, views_1.createViews)(mainWindow);
    // Register global shortcuts
    (0, shortcuts_1.registerBridgeShortcut)(views);
    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        if (mainWindow) {
            mainWindow.show();
            // Show onboarding on first run
            const hasSeenOnboarding = store_1.store.get('hasSeenOnboarding', false);
            if (!hasSeenOnboarding) {
                mainWindow.webContents.send('show-onboarding');
                store_1.store.set('hasSeenOnboarding', true);
            }
        }
    });
    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    // Handle layout changes from renderer
    electron_1.ipcMain.handle('update-layout', (_, rects) => {
        if (mainWindow) {
            (0, views_1.placeViews)(mainWindow, rects);
        }
    });
    // Handle URL changes
    electron_1.ipcMain.handle('change-url', async (_, viewId, url) => {
        try {
            console.log(`Changing ${viewId} URL to:`, url);
            await views[viewId].webContents.loadURL(url);
            store_1.store.set(`urls.${viewId}`, url);
            console.log(`Successfully loaded ${viewId} URL`);
            return { success: true };
        }
        catch (error) {
            console.error(`Failed to load ${viewId} URL:`, error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    });
    // Handle sermon data
    electron_1.ipcMain.handle('get-sermons', () => {
        return store_1.store.get('sermons', {});
    });
    electron_1.ipcMain.handle('save-sermon', (_, sermon) => {
        const sermons = store_1.store.get('sermons', {});
        sermons[sermon.id] = { ...sermon, updatedAt: new Date().toISOString() };
        store_1.store.set('sermons', sermons);
        return sermons;
    });
    electron_1.ipcMain.handle('get-layout', () => {
        return {
            sizes: store_1.store.get('layout.sizes', [280, undefined, 420]),
            collapsed: store_1.store.get('layout.collapsed', { left: false, right: false }),
            urls: store_1.store.get('urls', { logos: 'https://app.logos.com/', ai: 'https://chat.openai.com/' }),
        };
    });
    electron_1.ipcMain.handle('save-layout', (_, layout) => {
        store_1.store.set('layout', layout);
    });
    // Notes handlers
    electron_1.ipcMain.handle('get-notes', () => {
        return store_1.store.get('notes', {});
    });
    electron_1.ipcMain.handle('save-note', (_, note) => {
        const notes = store_1.store.get('notes', {});
        notes[note.id] = { ...note, updatedAt: new Date().toISOString() };
        store_1.store.set('notes', notes);
        return notes;
    });
    electron_1.ipcMain.handle('delete-note', (_, noteId) => {
        const notes = store_1.store.get('notes', {});
        delete notes[noteId];
        store_1.store.set('notes', notes);
        return notes;
    });
    // Handle Logos visibility toggle
    electron_1.ipcMain.handle('set-logos-visibility', async (_, visible) => {
        if (!mainWindow)
            return;
        if (visible) {
            // Show Logos view by adding it back - add it BEFORE the AI view to maintain proper z-order
            const currentViews = mainWindow.getBrowserViews();
            const aiView = currentViews.find(v => v === views.ai);
            // Remove all BrowserViews first
            currentViews.forEach(v => mainWindow.removeBrowserView(v));
            // Re-add in the correct order: Logos first, then AI
            mainWindow.addBrowserView(views.logos);
            if (aiView) {
                mainWindow.addBrowserView(views.ai);
            }
            console.log('Re-added BrowserViews in correct order (Logos, AI)');
        }
        else {
            // Hide Logos view by removing it
            mainWindow.removeBrowserView(views.logos);
            console.log('Removed Logos BrowserView');
        }
    });
    // Handle getting selected text from AI view
    electron_1.ipcMain.handle('get-ai-selection', async () => {
        try {
            const { clipboard } = require('electron');
            // Clear clipboard first to ensure we get fresh content
            clipboard.writeText('');
            // Focus AI view and wait longer for it to be ready
            views.ai.webContents.focus();
            await new Promise(resolve => setTimeout(resolve, 300));
            // Simulate copy command to get selection
            const isMac = process.platform === 'darwin';
            const modifier = isMac ? 'Meta' : 'Control';
            views.ai.webContents.sendInputEvent({ type: 'keyDown', keyCode: modifier });
            views.ai.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'c' });
            views.ai.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'c' });
            views.ai.webContents.sendInputEvent({ type: 'keyUp', keyCode: modifier });
            // Wait much longer for clipboard to update - ChatGPT can be slow
            await new Promise(resolve => setTimeout(resolve, 800));
            let selectedText = clipboard.readText();
            // If still empty, try one more time with even longer wait
            if (!selectedText || selectedText.trim().length === 0) {
                console.log('First copy attempt failed, trying again...');
                await new Promise(resolve => setTimeout(resolve, 500));
                selectedText = clipboard.readText();
            }
            console.log('AI selection - clipboard content:', selectedText?.substring(0, 100));
            // Check if we got text
            if (!selectedText || selectedText.trim().length === 0) {
                return {
                    success: false,
                    message: 'Could not copy text from ChatGPT. Try:\n1. Make sure text is highlighted in ChatGPT\n2. Manually copy with Cmd+C first\n3. Then click the button again'
                };
            }
            return { success: true, text: selectedText };
        }
        catch (error) {
            console.error('Error getting AI selection:', error);
            return { success: false, message: 'Failed to get selection from AI' };
        }
    });
    // Handle manual bridge trigger
    electron_1.ipcMain.handle('trigger-bridge-shortcut', async (_, fromNotesEditor = false) => {
        try {
            const { clipboard } = require('electron');
            let selectedText = '';
            // If this is from Notes Editor, use existing clipboard content
            if (fromNotesEditor) {
                selectedText = clipboard.readText();
                console.log('Using text from Notes Editor clipboard:', selectedText.substring(0, 50) + '...');
            }
            else {
                // Otherwise, always try to copy from Logos (it's visible)
                // Focus Logos view first
                views.logos.webContents.focus();
                await new Promise(resolve => setTimeout(resolve, 100));
                // Store the current clipboard content to compare later
                const originalClipboard = clipboard.readText();
                // Simulate copy command to get current selection
                const isMac = process.platform === 'darwin';
                const modifier = isMac ? 'Meta' : 'Control';
                views.logos.webContents.sendInputEvent({ type: 'keyDown', keyCode: modifier });
                views.logos.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'c' });
                views.logos.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'c' });
                views.logos.webContents.sendInputEvent({ type: 'keyUp', keyCode: modifier });
                // Wait for clipboard to update
                await new Promise(resolve => setTimeout(resolve, 300));
                selectedText = clipboard.readText();
                // Check if clipboard actually changed (indicating a new selection)
                if (selectedText === originalClipboard) {
                    return { success: false, message: 'No new text selected in Logos. Please highlight some text first.' };
                }
                if (!selectedText || selectedText.trim().length === 0) {
                    return { success: false, message: 'No text selected in Logos. Please highlight some text first.' };
                }
                console.log('Copied from Logos:', selectedText.substring(0, 50) + '...');
            }
            // Focus AI view and ensure it's ready
            views.ai.webContents.focus();
            await new Promise(resolve => setTimeout(resolve, 200));
            // Try to insert text directly into ChatGPT's input field
            try {
                const escapedText = selectedText.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$').replace(/\n/g, '\\n');
                const insertResult = await views.ai.webContents.executeJavaScript(`
                (function() {
                  const textToInsert = \`${escapedText}\`;
                  
                  // Try to find ChatGPT's input field
                  const textareas = document.querySelectorAll('textarea');
                  const contentEditables = document.querySelectorAll('[contenteditable="true"]');
                  
                  // Try textarea first
                  if (textareas.length > 0) {
                    const activeTextarea = Array.from(textareas).find(ta => 
                      ta.offsetParent !== null && ta.style.display !== 'none' && !ta.disabled
                    );
                    if (activeTextarea) {
                      activeTextarea.focus();
                      // Append text with line breaks
                      const currentValue = activeTextarea.value;
                      const separator = currentValue.trim() ? '\\n\\n' : ''; // Two newlines for spacing
                      activeTextarea.value = currentValue + separator + textToInsert;
                      activeTextarea.dispatchEvent(new Event('input', { bubbles: true }));
                      activeTextarea.dispatchEvent(new Event('change', { bubbles: true }));
                      return { success: true, method: 'textarea' };
                    }
                  }
                  
                  // Try contenteditable elements (newer ChatGPT UI)
                  if (contentEditables.length > 0) {
                    const activeEditable = Array.from(contentEditables).find(el => 
                      el.offsetParent !== null && el.style.display !== 'none'
                    );
                    if (activeEditable) {
                      activeEditable.focus();
                      
                      const currentText = activeEditable.textContent || '';
                      
                      // If there's existing content, add newlines before the new text
                      if (currentText.trim()) {
                        // Create a text node with newlines, then append the new text
                        const separator = document.createTextNode('\\n\\n');
                        const newText = document.createTextNode(textToInsert);
                        
                        // Move cursor to end
                        const range = document.createRange();
                        const sel = window.getSelection();
                        
                        // Append the separator and new text
                        activeEditable.appendChild(separator);
                        activeEditable.appendChild(newText);
                        
                        // Move cursor to end
                        range.selectNodeContents(activeEditable);
                        range.collapse(false);
                        sel.removeAllRanges();
                        sel.addRange(range);
                      } else {
                        // No existing content, just set the text
                        activeEditable.textContent = textToInsert;
                      }
                      
                      activeEditable.dispatchEvent(new Event('input', { bubbles: true }));
                      activeEditable.dispatchEvent(new Event('change', { bubbles: true }));
                      return { success: true, method: 'contenteditable' };
                    }
                  }
                  
                  return { success: false, message: 'No input field found' };
                })();
              `);
                console.log('Insert result:', insertResult);
                if (insertResult && insertResult.success) {
                    return { success: true, message: `Text inserted via ${insertResult.method}` };
                }
                // Fallback: use paste command
                console.log('Fallback to paste command');
                views.ai.webContents.paste();
                await new Promise(resolve => setTimeout(resolve, 100));
                const isMac = process.platform === 'darwin';
                const modifier = isMac ? 'Meta' : 'Control';
                views.ai.webContents.sendInputEvent({ type: 'keyDown', keyCode: modifier });
                views.ai.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'v' });
                views.ai.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'v' });
                views.ai.webContents.sendInputEvent({ type: 'keyUp', keyCode: modifier });
            }
            catch (pasteError) {
                console.error('Paste error:', pasteError);
                return { success: false, message: 'Failed to paste. Text is in clipboard - paste manually with Cmd+V' };
            }
            return { success: true, message: `Sent selection to AI (${selectedText.length} characters)` };
        }
        catch (error) {
            console.error('Bridge shortcut error:', error);
            return { success: false, message: 'Failed to send selection to AI' };
        }
    });
    // Handle save dialog
    electron_1.ipcMain.handle('save-dialog', async (_, options) => {
        if (!mainWindow)
            return { canceled: true };
        return await electron_1.dialog.showSaveDialog(mainWindow, options);
    });
    // Handle write file
    electron_1.ipcMain.handle('write-file', async (_, filePath, content) => {
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, content, 'utf8', (err) => {
                if (err)
                    reject(err);
                else
                    resolve(undefined);
            });
        });
    });
    // Handle print to PDF
    electron_1.ipcMain.handle('print-to-pdf', async (_, content, filePath) => {
        try {
            // Create a hidden window to render the content
            const pdfWindow = new electron_1.BrowserWindow({
                show: false,
                webPreferences: {
                    nodeIntegration: false,
                },
            });
            // Load the content as HTML
            await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Georgia, serif;
              font-size: 12pt;
              line-height: 1.6;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
        </html>
      `)}`);
            // Generate PDF
            const data = await pdfWindow.webContents.printToPDF({
                printBackground: true,
                preferCSSPageSize: true,
            });
            // Write PDF to file
            await fs.promises.writeFile(filePath, data);
            // Close the PDF window
            pdfWindow.close();
        }
        catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    });
}
// App event handlers
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
electron_1.app.on('will-quit', () => {
    electron_1.globalShortcut.unregisterAll();
});
