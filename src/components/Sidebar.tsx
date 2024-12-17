import React, { useState } from "react";
import { Pin, Trash2, Menu, X } from "lucide-react";
import { Note } from "../types/Note";

interface SidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (note: Note) => void;
  onTogglePin: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
  onCreateNote: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  notes,
  activeNoteId,
  onSelectNote,
  onTogglePin,
  onDeleteNote,
  onCreateNote,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const NoteList = () => (
    <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-150px)]">
      {notes.map((note) => {
        const isActive = activeNoteId === note.id;

        return (
          <div
            key={note.id}
            className={`p-3 rounded-lg cursor-pointer transition-all duration-200
              ${
                isActive
                  ? "bg-blue-100 dark:bg-gray-800/50 border-2 border-blue-500 dark:border-blue-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700/50 border-2 border-transparent"
              }
            `}
            onClick={() => {
              onSelectNote(note);
              setIsMobileMenuOpen(false);
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className={`truncate flex-1 ${
                  isActive
                    ? "text-blue-800 dark:text-blue-200 font-medium"
                    : "text-gray-800 dark:text-gray-200"
                }`}
              >
                {note.title}
              </span>
              <div className="flex items-center space-x-2 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin(note.id);
                  }}
                  className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 
                            transition-colors duration-200
                            ${
                              note.isPinned
                                ? "text-yellow-500"
                                : "text-gray-400 dark:text-gray-500"
                            }`}
                >
                  <Pin className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNote(note.id);
                  }}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 
                           text-red-400 dark:text-red-400 hover:text-red-500 dark:hover:text-red-400
                           transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-500 text-white p-2 rounded-full shadow-lg"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar for Desktop */}
      <div className="hidden md:block w-64 border-r border-gray-200 dark:border-white p-4 bg-white dark:bg-zinc-900 h-screen overflow-y-auto">
        <button
          onClick={onCreateNote}
          className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 
                   text-white rounded-lg px-4 py-2 mb-4 transition-colors duration-200 
                   font-medium shadow-sm"
        >
          New Note
        </button>
        <NoteList />
      </div>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`
          md:hidden fixed inset-0 z-40 bg-black/50 
          ${isMobileMenuOpen ? "block" : "hidden"}
        `}
        onClick={toggleMobileMenu}
      />
      <div
        className={`
          md:hidden fixed top-0 left-0 w-64 h-full bg-white dark:bg-zinc-900 
          border-r border-gray-200 dark:border-white p-4 z-50 transform transition-transform duration-300
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <button
          onClick={onCreateNote}
          className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 
                   text-white rounded-lg px-4 py-2 mb-4 transition-colors duration-200 
                   font-medium shadow-sm"
        >
          New Note
        </button>
        <NoteList />
      </div>
    </>
  );
};

export default Sidebar;
