import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Toolbar from "./components/Toolbar";
import Editor from "./components/Editor";
import { Note } from "./types/Note";
import { ThemeProvider } from "./components/themeprovider";

const App: React.FC = () => {
  // Initialize state from localStorage or with default values
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const savedNotes = localStorage.getItem("notes");
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes);
        return parsedNotes.map((note: any) => ({
          ...note,
          lastModified: new Date(note.lastModified),
        }));
      }
    } catch (error) {
      console.error("Error loading notes from localStorage:", error);
    }

    // Default note if no saved notes or error occurs
    const defaultNote: Note = {
      id: "1",
      title: "Welcome Note",
      content: "Start writing your notes here...",
      isPinned: false,
      lastModified: new Date(),
    };
    return [defaultNote];
  });

  const [activeNote, setActiveNote] = useState<Note | null>(
    () => notes[0] || null
  );

  // Save to localStorage whenever notes change
  useEffect(() => {
    try {
      const notesToSave = notes.map((note) => ({
        ...note,
        lastModified: note.lastModified.toISOString(), // Convert Date to string for storage
      }));
      localStorage.setItem("notes", JSON.stringify(notesToSave));
    } catch (error) {
      console.error("Error saving notes to localStorage:", error);
    }
  }, [notes]);

  const applyFormat = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
  };

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      isPinned: false,
      lastModified: new Date(),
    };
    setNotes((prev) => [...prev, newNote]);
    setActiveNote(newNote);
  };

  const togglePin = (noteId: string) => {
    setNotes((prevNotes) => {
      const updatedNotes = prevNotes.map((note) =>
        note.id === noteId
          ? { ...note, isPinned: !note.isPinned, lastModified: new Date() }
          : note
      );

      // Sort notes with pinned notes at the top
      return [...updatedNotes].sort((a, b) => {
        if (a.isPinned === b.isPinned) {
          return b.lastModified.getTime() - a.lastModified.getTime();
        }
        return a.isPinned ? -1 : 1;
      });
    });
  };

  const deleteNote = (noteId: string) => {
    setNotes((prev) => {
      const updatedNotes = prev.filter((note) => note.id !== noteId);
      if (activeNote?.id === noteId) {
        setActiveNote(updatedNotes[0] || null);
      }
      return updatedNotes;
    });
  };

  const updateNote = (updatedNote: Note) => {
    const noteWithUpdatedDate = {
      ...updatedNote,
      lastModified: new Date(),
    };

    setNotes((prev) => {
      const updatedNotes = prev.map((note) =>
        note.id === updatedNote.id ? noteWithUpdatedDate : note
      );

      return [...updatedNotes].sort((a, b) => {
        if (a.isPinned === b.isPinned) {
          return b.lastModified.getTime() - a.lastModified.getTime();
        }
        return a.isPinned ? -1 : 1;
      });
    });

    setActiveNote(noteWithUpdatedDate);
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex h-screen">
        <Sidebar
          notes={notes}
          activeNoteId={activeNote?.id || null}
          onSelectNote={setActiveNote}
          onTogglePin={togglePin}
          onDeleteNote={deleteNote}
          onCreateNote={createNewNote}
        />
        <div className="flex-1 flex flex-col">
          <Toolbar onApplyFormat={applyFormat} />
          <Editor
            key={activeNote?.id}
            activeNote={activeNote}
            onUpdateNote={updateNote}
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;
