import React, { useRef, useEffect, useState, useCallback } from "react";
import { Note } from "../types/Note";
import Groq from "groq-sdk";
import debounce from "lodash/debounce";
import { Input } from "@/components/ui/input";

interface EditorProps {
  activeNote: Note | null;
  onUpdateNote: (updatedNote: Note) => void;
}

interface SelectionPopup {
  text: string;
  definition?: string;
  position: { x: number; y: number };
}

interface TermDefinition {
  term: string;
  definition: string;
}

interface SavedSelection {
  offset: number;
  node: Node;
}

const Editor: React.FC<EditorProps> = ({ activeNote, onUpdateNote }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [popup, setPopup] = useState<SelectionPopup | null>(null);
  const [importantTerms] = useState<TermDefinition[]>([]);
  const [isHighlighting, setIsHighlighting] = useState(false);

  const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const saveSelection = (containerEl: HTMLElement): SavedSelection | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(containerEl);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);

    return {
      offset: preSelectionRange.toString().length,
      node: range.startContainer,
    };
  };

  const restoreSelection = (
    containerEl: HTMLElement,
    savedSel: SavedSelection
  ) => {
    const selection = window.getSelection();
    if (!selection) return;

    let charIndex = 0;
    const range = document.createRange();
    range.setStart(containerEl, 0);
    range.collapse(true);

    const nodeStack: Node[] = [containerEl];
    let node: Node | undefined;
    let foundStart = false;

    while (!foundStart && nodeStack.length > 0) {
      node = nodeStack.pop();
      if (!node) continue;

      if (node.nodeType === Node.TEXT_NODE) {
        const length = node.textContent?.length || 0;
        if (charIndex + length >= savedSel.offset) {
          range.setStart(node, savedSel.offset - charIndex);
          foundStart = true;
        } else {
          charIndex += length;
        }
      } else {
        for (let i = node.childNodes.length - 1; i >= 0; i--) {
          nodeStack.push(node.childNodes[i]);
        }
      }
    }

    if (selection && foundStart) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const analyzeContent = async (content: string) => {
    if (!content.trim()) return;

    try {
      const termsResponse = await groq.chat.completions.create({
        model: "mixtral-8x7b-32768",
        messages: [
          {
            role: "system",
            content:
              "Identify 2-3 important terms or concepts strictly from the text (if there are any) and provide very brief definitions. Return as JSON array with 'term' and 'definition' fields.",
          },
          {
            role: "user",
            content: content,
          },
        ],
        temperature: 0.3,
        max_tokens: 250,
      });

      const termsContent = termsResponse.choices[0]?.message?.content || "[]";
      let newTerms: TermDefinition[] = [];

      try {
        newTerms = JSON.parse(termsContent);
      } catch (e) {
        console.error("Failed to parse terms JSON:", e);
        newTerms = [];
      }

      if (!isHighlighting && editorRef.current) {
        setIsHighlighting(true);
        const editor = editorRef.current;
        const savedSelection = saveSelection(editor);

        let updatedContent = editor.innerHTML;
        newTerms.forEach((termObj) => {
          const escapedTerm = termObj.term.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          );
          const regex = new RegExp(
            `(?<!<[^>]*)\\b(${escapedTerm})\\b(?![^<]*>)`,
            "gi"
          );
          const escapedDefinition = termObj.definition.replace(/"/g, "&quot;");
          updatedContent = updatedContent.replace(
            regex,
            `<span class="term-highlight bg-blue-400 font-bold cursor-help" data-term="${termObj.term}" data-definition="${escapedDefinition}">$1</span>`
          );
        });

        if (editor.innerHTML !== updatedContent) {
          editor.innerHTML = updatedContent;
        }

        if (savedSelection) {
          restoreSelection(editor, savedSelection);
        }

        setIsHighlighting(false);
      }
    } catch (err) {
      console.error("Analysis error:", err);
    }
  };

  const debouncedAnalyze = useCallback(
    debounce((content: string) => analyzeContent(content), 1000),
    []
  );

  useEffect(() => {
    if (editorRef.current && activeNote) {
      editorRef.current.innerHTML = activeNote.content;
      debouncedAnalyze(activeNote.content);
    }
  }, [activeNote?.id]);

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("term-highlight")) {
        const term = target.getAttribute("data-term");
        const definition = target.getAttribute("data-definition");
        const rect = target.getBoundingClientRect();

        setPopup({
          text: term || "",
          definition: definition || "",
          position: {
            x: rect.left,
            y: rect.top - 40,
          },
        });
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const relatedTarget = e.relatedTarget as HTMLElement | null;

      if (
        target.classList.contains("term-highlight") &&
        (!relatedTarget || !relatedTarget.classList.contains("term-highlight"))
      ) {
        setPopup(null);
      }
    };

    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener("mouseover", handleMouseOver);
      editor.addEventListener("mouseout", handleMouseOut);
    }

    return () => {
      if (editor) {
        editor.removeEventListener("mouseover", handleMouseOver);
        editor.removeEventListener("mouseout", handleMouseOut);
      }
    };
  }, []);

  const handleContentChange = () => {
    if (activeNote && editorRef.current && !isHighlighting) {
      const newContent = editorRef.current.innerHTML;
      onUpdateNote({
        ...activeNote,
        content: newContent,
        lastModified: new Date(),
      });

      debouncedAnalyze(editorRef.current.innerText);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeNote) {
      onUpdateNote({
        ...activeNote,
        title: e.target.value,
        lastModified: new Date(),
      });
    }
  };

  if (!activeNote) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a note or create a new one
      </div>
    );
  }

  return (
    <div className="flex-1 gap-4 p-4">
      <div className="flex-1 space-y-2">
        <Input
          ref={titleInputRef}
          type="text"
          value={activeNote.title}
          onChange={handleTitleChange}
          className="w-full font-bold mb-4 p-5"
          placeholder="Note Title"
        />

        <div className="relative space-y-2">
          {popup && (
            <div
              className="absolute z-10 bg-white dark:bg-gray-800 shadow-md rounded-md p-1.5 border"
              style={{
                left: `${popup.position.x}px`,
                top: `${popup.position.y}px`,
                transform: "translateY(-100%)",
                maxWidth: "300px",
              }}
            >
              <div className="text-xs">
                <span className="font-semibold text-blue-600 dark:text-blue-400 mr-1">
                  {popup.text}:
                </span>
                <span className="text-gray-600 dark:text-gray-300">
                  {popup.definition}
                </span>
              </div>
            </div>
          )}

          <div
            ref={editorRef}
            contentEditable
            className="flex-1 focus:outline-none prose dark:prose-invert max-w-none min-h-[450px] p-4 border rounded-lg"
            onInput={handleContentChange}
            onBlur={handleContentChange}
            suppressContentEditableWarning={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Editor;
