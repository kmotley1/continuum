import { useEffect, useState, useRef } from 'react';
import ColumnHeader from './ColumnHeader';
import Planner from './Planner';
import SettingsModal from './SettingsModal';
import { Calendar, BookOpen, Brain, FileText, ChevronLeft, ChevronRight, StickyNote } from 'lucide-react';

interface Note {
  id: string;
  sermonDate: string;
  content: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
}

interface Sermon {
  id: string;
  date: string;
  title: string;
  passage: string;
  series: string;
  bigIdea?: string;
  notes: string; // Legacy - will be migrated
  noteIds?: string[]; // New: array of note IDs
  createdAt: string;
  updatedAt: string;
}

interface LayoutState {
  sizes: number[];
  collapsed: { left: boolean; right: boolean };
}

export default function SplitLayout() {
  const [layout, setLayout] = useState<LayoutState>({
    sizes: [280, 0, 420],
    collapsed: { left: false, right: false }
  });
  const [isLayoutLoaded, setIsLayoutLoaded] = useState(false);
  const [settingsModal, setSettingsModal] = useState<{
    isOpen: boolean;
    panelType: 'logos' | 'ai';
  }>({ isOpen: false, panelType: 'logos' });
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const [currentNoteSermon, setCurrentNoteSermon] = useState<Sermon | null>(null);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [allSermons, setAllSermons] = useState<Record<string, Sermon>>({});
  const [allNotes, setAllNotes] = useState<Record<string, Note>>({});
  const [notesContent, setNotesContent] = useState<string>('');
  const [showNotesSidebar, setShowNotesSidebar] = useState(false);
  
  const logosHostRef = useRef<HTMLDivElement>(null);
  const notesEditorRef = useRef<HTMLDivElement>(null);

  // Load layout from store
  useEffect(() => {
    const loadLayout = async () => {
      try {
        const savedLayout = await window.api.getLayout();
        if (savedLayout && savedLayout.sizes && savedLayout.collapsed) {
          setLayout(savedLayout);
        }
      } catch (error) {
        console.error('Failed to load layout:', error);
      }
      setIsLayoutLoaded(true);
    };
    loadLayout();
  }, []);

  // Save layout to store when it changes
  useEffect(() => {
    if (isLayoutLoaded) {
      window.api.saveLayout(layout);
    }
  }, [layout, isLayoutLoaded]);

  // Load data
  useEffect(() => {
    if (isLayoutLoaded) {
      const loadData = async () => {
        const [sermons, notes] = await Promise.all([
          window.api.getAllSermons(),
          window.api.getAllNotes()
        ]);
        setAllSermons(sermons);
        setAllNotes(notes);
      };
      loadData();
    }
  }, [isLayoutLoaded]);

  // Set up BrowserViews
  useEffect(() => {
    if (isLayoutLoaded && logosHostRef.current) {
      window.api.setupBrowserViews();
      
      // Set up resize observer
      const resizeObserver = new ResizeObserver(() => {
        window.api.resizeBrowserViews();
      });
      
      resizeObserver.observe(logosHostRef.current);
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [isLayoutLoaded]);

  const handleCollapse = (side: 'left' | 'right') => {
    setLayout(prev => ({
      ...prev,
      collapsed: {
        ...prev.collapsed,
        [side]: !prev.collapsed[side]
      }
    }));
  };

  if (!isLayoutLoaded || !layout || !layout.sizes || !layout.collapsed) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading Continuum...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-900 flex">
      {/* Notes Sidebar */}
      {showNotesSidebar && (
        <div className="w-64 flex-shrink-0 bg-gray-900 border-r border-gray-600 flex flex-col">
          <div className="bg-gray-700 border-b border-gray-600">
            <div className="h-12 flex items-center justify-between px-3">
              <span className="text-white text-sm font-semibold">All Notes</span>
              <button 
                onClick={() => setShowNotesSidebar(false)} 
                className="p-1 hover:bg-gray-600 rounded"
              >
                <ChevronLeft className="w-4 h-4 text-gray-300" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {Object.values(allSermons)
              .filter(sermon => sermon.noteIds && sermon.noteIds.length > 0)
              .map(sermon => {
                const sermonNotes = (sermon.noteIds || []).map(noteId => ({
                  id: noteId,
                  noteId,
                  content: allNotes[noteId]?.content || ''
                }));
                
                return (
                  <div key={sermon.id} className="mb-4">
                    <div className="text-xs text-gray-400 mb-1 px-1">
                      {new Date(sermon.date).toLocaleDateString()}
                    </div>
                    <div className="font-medium text-sm text-white mb-1 px-1">
                      {sermon.title || 'Untitled Sermon'}
                    </div>
                    {sermon.passage && (
                      <div className="text-xs text-gray-400 mb-2 px-1">
                        {sermon.passage}
                      </div>
                    )}
                    {sermonNotes.map(note => (
                      <button
                        key={note.id}
                        onClick={() => {
                          setCurrentNoteId(note.noteId || null);
                          setCurrentNoteSermon(sermon);
                          setShowNotesSidebar(false);
                          setIsNotesExpanded(true);
                        }}
                        className="w-full text-left p-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors mb-1"
                      >
                        <div className="text-xs truncate">
                          {note.content.replace(/<[^>]*>/g, '').trim().substring(0, 40) || 'Untitled note'}
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
          </div>
        </div>
      )}
      
      {/* Main App */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 border-b border-gray-600 flex items-center justify-between px-6 relative z-30 shadow-lg app-drag-region">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {!layout.collapsed.left && (
                <button
                  onClick={() => setShowNotesSidebar(true)}
                  className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                  title="Show notes list"
                >
                  <StickyNote className="w-4 h-4 text-gray-300" />
                </button>
              )}
              <BookOpen className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                {currentNoteSermon && currentNoteSermon.date ? (
                  <>
                    <div className="font-bold text-white text-base mb-2 flex-shrink-0">
                      {(() => {
                        const [year, month, day] = currentNoteSermon.date.split('-').map(Number);
                        return new Date(year, month - 1, day).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        });
                      })()}
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 overflow-y-auto max-h-24">
                      {currentNoteSermon.title && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 font-medium flex-shrink-0 whitespace-nowrap">Title:</span>
                          <span className="text-sm text-gray-200 truncate">{currentNoteSermon.title}</span>
                        </div>
                      )}
                      {currentNoteSermon.series && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 font-medium flex-shrink-0 whitespace-nowrap">Series:</span>
                          <span className="text-sm text-gray-200 truncate">{currentNoteSermon.series}</span>
                        </div>
                      )}
                      {currentNoteSermon.bigIdea && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 font-medium flex-shrink-0 whitespace-nowrap">Big Idea:</span>
                          <span className="text-sm text-gray-200 truncate">{currentNoteSermon.bigIdea}</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-gray-400 italic text-sm">
                    No Sunday assigned to this note
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 flex-shrink-0">
            <button
              onClick={async () => {
                try {
                  const selection = window.getSelection();
                  const selectedText = selection?.toString().trim();
                  if (selectedText && selectedText.length > 0) {
                    await navigator.clipboard.writeText(selectedText);
                    const result = await window.api.triggerBridgeShortcut(true);
                    if (!result.success) {
                      alert('Text is in clipboard. Please paste in ChatGPT manually.');
                    }
                  } else {
                    alert('No text selected. Please highlight some text first.');
                  }
                } catch (error) {
                  console.error('Failed to send to Chat:', error);
                  alert('Error: ' + error.message);
                }
              }}
              className="accent-button px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 shadow-md whitespace-nowrap"
              title="Send highlighted text from Notes to Chat"
            >
              <kbd className="bg-white/20 px-1.5 py-0.5 rounded text-xs">⌘⇧L</kbd>
              <span>Send to Chat</span>
            </button>
            <button
              onClick={() => {
                setShowNotesSidebar(!showNotesSidebar);
                if (!showNotesSidebar && layout.collapsed.left) {
                  handleCollapse('left');
                }
              }}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 pointer-events-auto whitespace-nowrap ${
                showNotesSidebar 
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {showNotesSidebar ? 'Cancel Assignment' : (currentNoteSermon && currentNoteSermon.date ? 'Reassign Sunday' : 'Assign Sunday')}
            </button>
            <button
              onClick={async () => {
                if (notesEditorRef.current) {
                  const content = notesEditorRef.current.innerHTML;
                  if (currentNoteId) {
                    const note = allNotes[currentNoteId];
                    if (note) {
                      const updatedNote = {
                        ...note,
                        content: content,
                        updatedAt: new Date().toISOString()
                      };
                      const result = await window.api.saveNote(updatedNote);
                      setAllNotes(result);
                    }
                  } else if (currentNoteSermon) {
                    const updatedSermon = {
                      ...currentNoteSermon,
                      notes: content,
                      updatedAt: new Date().toISOString()
                    };
                    const result = await window.api.saveSermon(updatedSermon);
                    setAllSermons(prev => ({ ...prev, [result.id]: result }));
                    setCurrentNoteSermon(result);
                  }
                }
                setIsNotesExpanded(false);
                setShowNotesSidebar(false);
                await window.api.setLogosVisibility(true);
                setTimeout(() => {
                  handleCollapse('left');
                }, 100);
              }}
              className="px-3 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 pointer-events-auto whitespace-nowrap"
            >
              Close
            </button>
          </div>
        </div>

        {/* Notes Editor */}
        {isNotesExpanded && (
          <div className="bg-gray-700 border-b border-gray-600 p-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => document.execCommand('bold')}
                className="p-2 hover:bg-gray-600 rounded text-white transition-colors"
                title="Bold"
              >
                <span className="font-bold text-sm">B</span>
              </button>
              <button
                onClick={() => document.execCommand('italic')}
                className="p-2 hover:bg-gray-600 rounded text-white transition-colors"
                title="Italic"
              >
                <span className="italic text-sm">I</span>
              </button>
              <button
                onClick={() => document.execCommand('underline')}
                className="p-2 hover:bg-gray-600 rounded text-white transition-colors"
                title="Underline"
              >
                <span className="underline text-sm">U</span>
              </button>
              <div className="w-px h-6 bg-gray-500 mx-1"></div>
              <select
                onChange={(e) => document.execCommand('fontSize', false, e.target.value)}
                className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-500 transition-colors"
                title="Font Size"
                defaultValue="3"
              >
                <option value="1">8pt</option>
                <option value="2">10pt</option>
                <option value="3">12pt</option>
                <option value="4">14pt</option>
                <option value="5">18pt</option>
                <option value="6">24pt</option>
                <option value="7">36pt</option>
              </select>
              <input
                type="color"
                onChange={(e) => document.execCommand('foreColor', false, e.target.value)}
                className="w-7 h-7 rounded cursor-pointer bg-gray-600 border border-gray-500"
                title="Text Color"
                defaultValue="#000000"
              />
              <div className="w-px h-6 bg-gray-500 mx-1"></div>
              <button
                onClick={() => document.execCommand('backColor', false, '#ffff00')}
                className="w-5 h-5 rounded border border-gray-500"
                style={{ backgroundColor: '#ffff00' }}
                title="Yellow Highlight"
              ></button>
              <button
                onClick={() => document.execCommand('backColor', false, '#90EE90')}
                className="w-5 h-5 rounded border border-gray-500"
                style={{ backgroundColor: '#90EE90' }}
                title="Green Highlight"
              ></button>
              <button
                onClick={() => document.execCommand('backColor', false, '#ADD8E6')}
                className="w-5 h-5 rounded border border-gray-500"
                style={{ backgroundColor: '#ADD8E6' }}
                title="Blue Highlight"
              ></button>
              <button
                onClick={() => document.execCommand('backColor', false, '#FFB6C1')}
                className="w-5 h-5 rounded border border-gray-500"
                style={{ backgroundColor: '#FFB6C1' }}
                title="Pink Highlight"
              ></button>
              <button
                onClick={() => document.execCommand('backColor', false, '#FFA500')}
                className="w-5 h-5 rounded border border-gray-500"
                style={{ backgroundColor: '#FFA500' }}
                title="Orange Highlight"
              ></button>
              <button
                onClick={() => document.execCommand('backColor', false, 'transparent')}
                className="w-5 h-5 rounded border-2 border-gray-500 bg-white relative"
                title="Remove Highlight"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-px bg-red-500 rotate-45"></div>
                </div>
              </button>
              <div className="w-px h-6 bg-gray-500 mx-1"></div>
              <button
                onClick={() => document.execCommand('insertUnorderedList')}
                className="p-1.5 hover:bg-gray-600 rounded text-white transition-colors"
                title="Bullet List"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => document.execCommand('insertOrderedList')}
                className="p-1.5 hover:bg-gray-600 rounded text-white transition-colors"
                title="Numbered List"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </button>
              <div className="flex-1"></div>
              <div className="relative group">
                <button className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors">
                  Download ▾
                </button>
                <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[120px]">
                  <button
                    onClick={async () => {
                      if (notesEditorRef.current) {
                        const content = notesEditorRef.current.innerHTML;
                        const options = {
                          title: 'Save Note as RTF',
                          defaultPath: `note_${new Date().toISOString().split('T')[0]}.rtf`,
                          filters: [
                            { name: 'Rich Text Format', extensions: ['rtf'] }
                          ]
                        };
                        const result = await window.api.saveDialog(options);
                        if (!result.canceled && result.filePath) {
                          const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}} \\f0\\fs24 ${content.replace(/<br\s*\/?>/gi, '\\\\par ').replace(/<[^>]*>/g, '')}}`;
                          await window.api.writeFile(result.filePath, rtfContent);
                        }
                      }
                    }}
                    className="block w-full text-left px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                  >
                    Save as RTF
                  </button>
                  <button
                    onClick={async () => {
                      if (notesEditorRef.current) {
                        const content = notesEditorRef.current.innerHTML;
                        const options = {
                          title: 'Save Note as PDF',
                          defaultPath: `note_${new Date().toISOString().split('T')[0]}.pdf`,
                          filters: [
                            { name: 'PDF', extensions: ['pdf'] }
                          ]
                        };
                        const result = await window.api.saveDialog(options);
                        if (!result.canceled && result.filePath) {
                          await window.api.printToPDF(content, result.filePath);
                        }
                      }
                    }}
                    className="block w-full text-left px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                  >
                    Save as PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex relative">
          {/* Left Panel - Sermon Planner */}
          <div className={`bg-gray-800 border-r border-gray-600 flex flex-col transition-all duration-300 ${layout.collapsed.left ? 'w-0 overflow-hidden' : ''}`} style={{ width: layout.collapsed.left ? 0 : layout.sizes[0] }}>
            {/* Left Panel Expand Tab */}
            {layout.collapsed.left && (
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20">
                <button
                  onClick={() => handleCollapse('left')}
                  className="bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-r-lg px-3 py-6 text-white text-xs font-medium shadow-lg transition-all duration-200 hover:shadow-xl"
                  title="Expand Sermon Planner"
                >
                  <div className="writing-mode-vertical-rl text-orientation-mixed">
                    <Calendar className="w-4 h-4 mb-1" />
                    <span>Plan</span>
                  </div>
                </button>
              </div>
            )}
            
            {!layout.collapsed.left && (
              <>
                <ColumnHeader
                  title="Sermon Planner"
                  icon={<Calendar className="w-4 h-4" />}
                  collapsed={false}
                  onToggle={() => {}}
                  showToggle={false}
                  actions={[
                    { label: 'Settings', onClick: () => {
                      setSettingsModal({ isOpen: true, panelType: 'logos' });
                    }}
                  ]}
                />
                <div className="flex-1 overflow-hidden">
                  <Planner
                    allSermons={allSermons}
                    setAllSermons={setAllSermons}
                    allNotes={allNotes}
                    setAllNotes={setAllNotes}
                    currentNoteId={currentNoteId}
                    setCurrentNoteId={setCurrentNoteId}
                    setCurrentNoteSermon={setCurrentNoteSermon}
                    setIsNotesExpanded={setIsNotesExpanded}
                    setShowNotesSidebar={setShowNotesSidebar}
                  />
                </div>
              </>
            )}
          </div>

          {/* Middle Panel - Logos */}
          <div className="flex-1 bg-gray-700 relative">
            <div ref={logosHostRef} className="w-full h-full browser-view-container" />
          </div>

          {/* Right Panel - AI Workspace */}
          <div className={`bg-gray-800 border-l border-gray-600 flex flex-col transition-all duration-300 ${layout.collapsed.right ? 'w-0 overflow-hidden' : ''}`} style={{ width: layout.collapsed.right ? 0 : layout.sizes[2] }}>
            {/* Right Panel Expand Tab */}
            {layout.collapsed.right && (
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20">
                <button
                  onClick={() => handleCollapse('right')}
                  className="bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-l-lg px-3 py-6 text-white text-xs font-medium shadow-lg transition-all duration-200 hover:shadow-xl"
                  title="Expand AI Workspace"
                >
                  <div className="writing-mode-vertical-rl text-orientation-mixed">
                    <Brain className="w-4 h-4 mb-1" />
                    <span>AI</span>
                  </div>
                </button>
              </div>
            )}
            
            {!layout.collapsed.right && (
              <>
                <ColumnHeader
                  title="AI Workspace"
                  icon={<Brain className="w-4 h-4" />}
                  collapsed={false}
                  onToggle={() => {}} // AI panel cannot be collapsed
                  showToggle={false} // Hide the toggle arrow
                  actions={[
                    { label: 'Clear', onClick: async () => {
                      const chatgptUrl = 'https://chat.openai.com/';
                      try {
                        const result = await window.api.changeUrl('ai', chatgptUrl);
                        if (!result.success) {
                          const altResult = await window.api.changeUrl('ai', 'https://chatgpt.com/');
                        }
                      } catch (error) {
                        console.error('Failed to clear AI chat:', error);
                      }
                    }},
                    { label: 'Settings', onClick: () => {
                      setSettingsModal({ isOpen: true, panelType: 'ai' });
                    }}
                  ]}
                />
                <div className="flex-1 relative">
                  <div className="w-full h-full browser-view-container" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Notes Editor Content */}
        {isNotesExpanded && (
          <div className="flex-1 bg-white relative">
            <div
              ref={notesEditorRef}
              contentEditable
              className="w-full h-full p-4 overflow-y-auto focus:outline-none"
              style={{
                fontFamily: 'Times New Roman, serif',
                fontSize: '14px',
                lineHeight: '1.6'
              }}
              onInput={(e) => {
                setNotesContent((e.target as HTMLDivElement).innerHTML);
              }}
              dangerouslySetInnerHTML={{
                __html: currentNoteId 
                  ? allNotes[currentNoteId]?.content || ''
                  : currentNoteSermon?.notes || ''
              }}
            />
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {settingsModal.isOpen && (
        <SettingsModal
          isOpen={settingsModal.isOpen}
          onClose={() => setSettingsModal({ isOpen: false, panelType: 'logos' })}
          panelType={settingsModal.panelType}
        />
      )}
    </div>
  );
}