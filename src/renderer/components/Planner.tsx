import React, { useEffect, useState } from 'react';
import { Plus, Calendar, BookOpen, Save } from 'lucide-react';

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

interface SermonSeries {
  id: string;
  name: string;
  color: string;
}

interface PlannerProps {
  isNotesExpanded: boolean;
  setIsNotesExpanded: (expanded: boolean) => void;
  currentNoteSermon: Sermon | null;
  setCurrentNoteSermon: (sermon: Sermon | null) => void;
  currentNoteId: string | null;
  setCurrentNoteId: (noteId: string | null) => void;
  isAssigningSunday: boolean;
  setIsAssigningSunday: (assigning: boolean) => void;
  notesContent: string;
  allSermons: Record<string, Sermon>;
  setAllSermons: (sermons: Record<string, Sermon>) => void;
  allNotes: Record<string, Note>;
  setAllNotes: (notes: Record<string, Note>) => void;
}

export default function Planner({ 
  isNotesExpanded, 
  setIsNotesExpanded, 
  currentNoteSermon, 
  setCurrentNoteSermon,
  currentNoteId,
  setCurrentNoteId,
  isAssigningSunday,
  setIsAssigningSunday,
  notesContent,
  allSermons,
  setAllSermons,
  allNotes,
  setAllNotes
}: PlannerProps) {
  const [sermons, setSermons] = useState<Record<string, Sermon>>({});
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSeriesDropdown, setShowSeriesDropdown] = useState(false);

  // Get unique series from existing sermons plus default series
  const getAvailableSeries = (): SermonSeries[] => {
    const defaultSeries: SermonSeries[] = [
      { id: 'advent-2024', name: 'Advent 2024', color: 'bg-red-100 text-red-800' },
      { id: 'psalms-2024', name: 'Psalms of Praise', color: 'bg-blue-100 text-blue-800' },
      { id: 'john-2024', name: 'Gospel of John', color: 'bg-green-100 text-green-800' },
    ];
    
    const existingSeries = Object.values(sermons)
      .map(sermon => sermon.series)
      .filter(series => series && series.trim() !== '')
      .map(series => ({
        id: series.toLowerCase().replace(/\s+/g, '-'),
        name: series,
        color: 'bg-gray-100 text-gray-800'
      }));
    
    // Combine and deduplicate
    const allSeries = [...defaultSeries, ...existingSeries];
    const uniqueSeries = allSeries.filter((series, index, self) => 
      index === self.findIndex(s => s.name === series.name)
    );
    
    return uniqueSeries;
  };

  const series = getAvailableSeries();

  useEffect(() => {
    loadSermons();
  }, []);

  // Reload sermons when Notes Editor closes
  useEffect(() => {
    if (!isNotesExpanded) {
      loadSermons();
    }
  }, [isNotesExpanded]);

  // Sync local sermons state with allSermons from parent
  useEffect(() => {
    if (allSermons && Object.keys(allSermons).length > 0) {
      setSermons(allSermons);
    }
  }, [allSermons]);

  // Sync with currentNoteSermon when it's updated externally (from Notes Editor)
  useEffect(() => {
    if (currentNoteSermon && selectedSermon?.id === currentNoteSermon.id) {
      setSelectedSermon(currentNoteSermon);
    }
  }, [currentNoteSermon]);

  // Sync selectedSermon with sermons state when sermons update
  useEffect(() => {
    if (selectedSermon && sermons[selectedSermon.id]) {
      const updatedSermon = sermons[selectedSermon.id];
      if (updatedSermon.notes !== selectedSermon.notes) {
        setSelectedSermon(updatedSermon);
      }
    }
  }, [sermons]);

  const loadSermons = async () => {
    const data = await window.api.getSermons();
    setSermons(data);
  };

  const saveSermon = async (sermon: Sermon) => {
    const updatedSermons = await window.api.saveSermon(sermon);
    setSermons(updatedSermons);
  };

  // Auto-save function that saves data as user types
  const autoSaveSermon = async (sermon: Sermon) => {
    try {
      await saveSermon(sermon);
      console.log('Auto-saved sermon for', sermon.date);
    } catch (error) {
      console.error('Failed to auto-save sermon:', error);
    }
  };

  const getSermonsForMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const weeks = [];
    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + (i * 7 + j));
        const dateKey = date.toISOString().split('T')[0];
        const sermon = sermons[dateKey];
        
        week.push({
          date,
          dateKey,
          sermon,
          isCurrentMonth: date.getMonth() === month,
          isToday: date.toDateString() === new Date().toDateString(),
          isSunday: date.getDay() === 0,
          isSelected: selectedDate === dateKey
        });
      }
      weeks.push(week);
    }
    return weeks;
  };

  const handleDateClick = (dateKey: string, sermon?: Sermon) => {
    // If in assignment mode, assign the note to this Sunday
    if (isAssigningSunday) {
      const existingSermon = sermons[dateKey];
      
      if (existingSermon) {
        // Assign note content to existing sermon
        const updatedSermon = {
          ...existingSermon,
          notes: notesContent || currentNoteSermon?.notes || '',
          updatedAt: new Date().toISOString()
        };
        
        window.api.saveSermon(updatedSermon).then((updatedSermons) => {
          setSermons(updatedSermons);
          setAllSermons(updatedSermons);
          setCurrentNoteSermon(updatedSermon);
          setIsAssigningSunday(false);
          console.log('Note assigned to', dateKey);
        });
      } else {
        // Create new sermon with note content
        const newSermon: Sermon = {
          id: dateKey,
          date: dateKey,
          title: '',
          passage: '',
          series: '',
          bigIdea: '',
          notes: notesContent || currentNoteSermon?.notes || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        window.api.saveSermon(newSermon).then((updatedSermons) => {
          setSermons(updatedSermons);
          setAllSermons(updatedSermons);
          setCurrentNoteSermon(newSermon);
          setIsAssigningSunday(false);
          console.log('Note assigned to new sermon on', dateKey);
        });
      }
      return;
    }
    
    // Normal mode: select sermon for editing
    setSelectedDate(dateKey);
    
    // Check if there's existing data for this date
    const existingSermon = sermons[dateKey];
    
    if (existingSermon) {
      // Load existing sermon data
      setSelectedSermon(existingSermon);
      setShowAddForm(false);
    } else {
      // Create new sermon for this date
      setSelectedSermon({
        id: dateKey,
        date: dateKey,
        title: '',
        passage: '',
        series: '',
        bigIdea: '',
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setShowAddForm(true);
    }
  };

  const handleSaveSermon = () => {
    if (selectedSermon) {
      saveSermon(selectedSermon);
      setShowAddForm(false);
      // Keep selectedSermon and selectedDate to maintain the highlight
    }
  };

  const insertFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (selectedSermon && text) {
        const updatedSermon = {
          ...selectedSermon,
          notes: selectedSermon.notes + (selectedSermon.notes ? '\n\n' : '') + text,
          updatedAt: new Date().toISOString()
        };
        setSelectedSermon(updatedSermon);
        // Auto-save after inserting from clipboard
        setTimeout(() => autoSaveSermon(updatedSermon), 500);
        // Show a brief notification
        console.log('Text inserted from clipboard');
      }
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      alert('Failed to read clipboard. Please make sure you have text copied.');
    }
  };

  const weeks = getSermonsForMonth();
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  return (
    <div className="h-full flex flex-col bg-gray-800 relative">
      {/* Assignment Mode Indicator */}
      {isAssigningSunday && (
        <div className="bg-blue-600 px-4 py-2 text-white text-sm font-medium flex items-center justify-between">
          <span>📅 Click a Sunday on the calendar to assign this note</span>
          <button
            onClick={() => setIsAssigningSunday(false)}
            className="text-xs bg-white text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
      
      {/* Calendar Header */}
      <div className={`p-4 border-b ${isAssigningSunday ? 'bg-blue-600/20 border-blue-500 ring-4 ring-blue-500/30 shadow-lg shadow-blue-500/20' : 'border-gray-700'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                console.log('Previous month button clicked');
                const newDate = new Date(currentDate);
                newDate.setMonth(newDate.getMonth() - 1);
                setCurrentDate(newDate);
              }}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white"
              title="Previous month"
            >
              ←
            </button>
            <h3 className="text-lg font-semibold text-white min-w-[150px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button
              onClick={() => {
                console.log('Next month button clicked');
                const newDate = new Date(currentDate);
                newDate.setMonth(newDate.getMonth() + 1);
                setCurrentDate(newDate);
              }}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white"
              title="Next month"
            >
              →
            </button>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Sermon
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-400 p-2">
              {day}
            </div>
          ))}
          
          {weeks.flat().map((day, index) => (
              <button
                key={index}
                onClick={() => handleDateClick(day.dateKey, day.sermon)}
                className={`
                  p-2 text-sm rounded-lg transition-colors relative
                  ${!day.isCurrentMonth ? 'text-gray-500' : 'text-gray-200 hover:bg-gray-700'}
                  ${day.isToday ? 'bg-blue-600 text-white font-semibold shadow-md' : ''}
                  ${day.isSelected ? 'text-white font-semibold shadow-md border-2 border-[#ef1a3a]' : ''}
                  ${day.isSelected ? 'bg-[#ef1a3a]' : ''}
                `}
              >
              <div className="text-center">{day.date.getDate()}</div>
              {day.sermon && (
                day.sermon.title?.trim() || 
                day.sermon.passage?.trim() || 
                day.sermon.notes?.trim() || 
                day.sermon.bigIdea?.trim() ||
                (day.sermon.noteIds && day.sermon.noteIds.length > 0)
              ) && (
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sermon Details or Notes List */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedSermon && (
        <div className="p-4 overflow-y-auto border-b border-gray-700">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Sermon Title
              </label>
                    <input
                      type="text"
                      value={selectedSermon.title}
                      onChange={(e) => {
                        const updatedSermon = { ...selectedSermon, title: e.target.value, updatedAt: new Date().toISOString() };
                        setSelectedSermon(updatedSermon);
                        // Auto-save after a short delay
                        setTimeout(() => autoSaveSermon(updatedSermon), 1000);
                      }}
                      className="modern-input w-full px-3 py-2 rounded-lg"
                      placeholder="Sermon title..."
                    />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Scripture
              </label>
                    <input
                      type="text"
                      value={selectedSermon.passage}
                      onChange={(e) => {
                        const updatedSermon = { ...selectedSermon, passage: e.target.value, updatedAt: new Date().toISOString() };
                        setSelectedSermon(updatedSermon);
                        // Auto-save after a short delay
                        setTimeout(() => autoSaveSermon(updatedSermon), 1000);
                      }}
                      className="modern-input w-full px-3 py-2 rounded-lg"
                      placeholder="e.g., John 3:16"
                    />
            </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Sermon Series
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={selectedSermon.series}
                        onChange={(e) => {
                          const updatedSermon = { ...selectedSermon, series: e.target.value, updatedAt: new Date().toISOString() };
                          setSelectedSermon(updatedSermon);
                          setShowSeriesDropdown(true);
                          // Auto-save after a short delay
                          setTimeout(() => autoSaveSermon(updatedSermon), 1000);
                        }}
                        onFocus={() => setShowSeriesDropdown(true)}
                        onBlur={() => {
                          // Delay hiding to allow clicking on dropdown items
                          setTimeout(() => setShowSeriesDropdown(false), 200);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setShowSeriesDropdown(false);
                            e.currentTarget.blur();
                          } else if (e.key === 'Escape') {
                            setShowSeriesDropdown(false);
                            e.currentTarget.blur();
                          }
                        }}
                        className="modern-input w-full px-3 py-2 rounded-lg"
                        placeholder="Type or select series..."
                      />
                      
                      {/* Dropdown arrow */}
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>

                      {/* Dropdown list */}
                      {showSeriesDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                          {series
                            .filter(s => s.name.toLowerCase().includes(selectedSermon.series.toLowerCase()))
                            .map(s => (
                              <button
                                key={s.id}
                                onClick={() => {
                                  const updatedSermon = { ...selectedSermon, series: s.name, updatedAt: new Date().toISOString() };
                                  setSelectedSermon(updatedSermon);
                                  setShowSeriesDropdown(false);
                                  // Auto-save immediately when selecting from dropdown
                                  autoSaveSermon(updatedSermon);
                                }}
                                className="w-full px-3 py-2 text-left text-gray-200 hover:bg-gray-700 transition-colors"
                              >
                                {s.name}
                              </button>
                            ))}
                          {selectedSermon.series && !series.some(s => s.name.toLowerCase() === selectedSermon.series.toLowerCase()) && (
                            <div className="px-3 py-2 text-sm text-gray-400 border-t border-gray-600">
                              Press Enter to create "{selectedSermon.series}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Big Idea
              </label>
              <input
                type="text"
                value={selectedSermon.bigIdea || ''}
                onChange={(e) => {
                  const updatedSermon = { ...selectedSermon, bigIdea: e.target.value, updatedAt: new Date().toISOString() };
                  setSelectedSermon(updatedSermon);
                  // Auto-save after a short delay
                  setTimeout(() => autoSaveSermon(updatedSermon), 1000);
                }}
                className="modern-input w-full px-3 py-2 rounded-lg"
                placeholder="The main point or central message..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Notes
                </label>
                <button
                  onClick={async () => {
                    console.log('Creating new note for:', selectedSermon.date);
                    
                    // Create a new note
                    const noteId = `note-${Date.now()}`;
                    const newNote: Note = {
                      id: noteId,
                      sermonDate: selectedSermon.date,
                      content: '<p><br></p>',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    };
                    
                    const updatedNotes = await window.api.saveNote(newNote);
                    setAllNotes(updatedNotes);
                    
                    // Add note ID to sermon's noteIds array
                    const updatedSermon = {
                      ...selectedSermon,
                      noteIds: [...(selectedSermon.noteIds || []), noteId],
                      updatedAt: new Date().toISOString()
                    };
                    const updatedSermons = await window.api.saveSermon(updatedSermon);
                    setSermons(updatedSermons);
                    setAllSermons(updatedSermons);
                    setSelectedSermon(updatedSermon);
                    
                    // Open the note editor
                    setCurrentNoteId(noteId);
                    setCurrentNoteSermon(updatedSermon);
                    setIsNotesExpanded(true);
                    console.log('Created new note:', noteId);
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  + Add Note
                </button>
              </div>
              <div className="space-y-1">
                {(() => {
                  // Get all notes for this sermon (both legacy and new format)
                  const notes: Array<{ id: string; content: string; isLegacy?: boolean }> = [];
                  
                  // Legacy note (from sermon.notes field)
                  if (selectedSermon.notes && selectedSermon.notes.trim()) {
                    notes.push({
                      id: `legacy-${selectedSermon.date}`,
                      content: selectedSermon.notes,
                      isLegacy: true
                    });
                  }
                  
                  // New notes (from sermon.noteIds)
                  if (selectedSermon.noteIds) {
                    selectedSermon.noteIds.forEach(noteId => {
                      const note = allNotes[noteId];
                      if (note) {
                        notes.push({
                          id: note.id,
                          content: note.content,
                          isLegacy: false
                        });
                      }
                    });
                  }
                  
                  console.log('Notes for', selectedSermon.date, ':', notes);
                  
                  return notes.length > 0 ? (
                    notes.map((note) => (
                      <div key={note.id} className="w-full max-w-[240px] flex items-center gap-1">
                        <button
                          onClick={() => {
                            console.log('Opening note:', note.id);
                            setCurrentNoteId(note.isLegacy ? null : note.id);
                            setCurrentNoteSermon(selectedSermon);
                            setIsNotesExpanded(true);
                          }}
                          className="flex-1 text-left px-3 py-2 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded text-xs text-gray-300 hover:text-white transition-colors flex items-center gap-2 min-w-0"
                        >
                          <BookOpen className="w-3 h-3 text-blue-400 flex-shrink-0" />
                          <span className="truncate flex-1 min-w-0">
                            {(() => {
                              const text = note.content.replace(/<[^>]*>/g, '').trim();
                              return text.substring(0, 50) + (text.length > 50 ? '...' : '') || 'Untitled note';
                            })()}
                          </span>
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Delete this note? This cannot be undone.')) {
                              if (note.isLegacy) {
                                // Delete legacy note
                                const updatedSermon = {
                                  ...selectedSermon,
                                  notes: '',
                                  updatedAt: new Date().toISOString()
                                };
                                const updatedSermons = await window.api.saveSermon(updatedSermon);
                                setSermons(updatedSermons);
                                setAllSermons(updatedSermons);
                                setSelectedSermon(updatedSermon);
                              } else {
                                // Delete new note
                                const updatedNotes = await window.api.deleteNote(note.id);
                                setAllNotes(updatedNotes);
                                
                                // Remove note ID from sermon
                                const updatedSermon = {
                                  ...selectedSermon,
                                  noteIds: (selectedSermon.noteIds || []).filter(id => id !== note.id),
                                  updatedAt: new Date().toISOString()
                                };
                                const updatedSermons = await window.api.saveSermon(updatedSermon);
                                setSermons(updatedSermons);
                                setAllSermons(updatedSermons);
                                setSelectedSermon(updatedSermon);
                              }
                              console.log('Deleted note:', note.id);
                            }
                          }}
                          className="px-2 py-2 bg-red-600/20 hover:bg-red-600 border border-red-600/50 hover:border-red-500 rounded text-xs text-red-400 hover:text-white transition-colors"
                          title="Delete note"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500 italic px-3 py-2">
                      No notes yet
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  console.log('Cancel button clicked');
                  setSelectedSermon(null);
                  setSelectedDate(null);
                  setShowAddForm(false);
                }}
                className="modern-button px-4 py-2 rounded-lg w-full"
              >
                Done
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
