import { clipboard, globalShortcut, BrowserWindow } from 'electron';

export function registerBridgeShortcut({ logos, ai }: { logos: Electron.BrowserView; ai: Electron.BrowserView; }) {
  globalShortcut.register('CommandOrControl+Shift+L', async () => {
    try {
      const mainWindow = BrowserWindow.getAllWindows()[0];
      if (!mainWindow) return;

      // Focus Logos view
      logos.webContents.focus();
      
      // Simulate copy command
      const isMac = process.platform === 'darwin';
      const modifier = isMac ? 'Meta' : 'Control';
      
      logos.webContents.sendInputEvent({ type: 'keyDown', keyCode: modifier });
      logos.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'c' });
      logos.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'c' });
      logos.webContents.sendInputEvent({ type: 'keyUp', keyCode: modifier });
      
      // Wait for clipboard to update
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const selectedText = clipboard.readText();
      if (!selectedText || selectedText.trim().length === 0) {
        mainWindow.webContents.send('bridge-toast', {
          type: 'error',
          message: 'No text selected in Logos'
        });
        return;
      }

      // Focus AI view and paste
      ai.webContents.focus();
      clipboard.writeText(selectedText);
      
      ai.webContents.sendInputEvent({ type: 'keyDown', keyCode: modifier });
      ai.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'v' });
      ai.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'v' });
      ai.webContents.sendInputEvent({ type: 'keyUp', keyCode: modifier });

      // Show success toast
      mainWindow.webContents.send('bridge-toast', {
        type: 'success',
        message: `Sent selection to AI (${selectedText.length} characters)`
      });

      // Also send context to renderer for sermon planner
      mainWindow.webContents.send('selection-from-logos', {
        text: selectedText,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Bridge shortcut error:', error);
      const mainWindow = BrowserWindow.getAllWindows()[0];
      if (mainWindow) {
        mainWindow.webContents.send('bridge-toast', {
          type: 'error',
          message: 'Failed to send selection to AI'
        });
      }
    }
  });
}

