import React from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Strikethrough,
  // Eraser,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ModeToggle } from "./mode-toggle";

interface ToolbarProps {
  onApplyFormat: (command: string, value?: string) => void;
}

const FONT_FAMILIES = [
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Times New Roman", value: "Times New Roman, serif" },
  { label: "Courier New", value: "Courier New, monospace" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
];

const Toolbar: React.FC<ToolbarProps> = ({ onApplyFormat }) => {
  const ToolbarButton = ({
    command,
    value,
    children,
    title,
  }: {
    command: string;
    value?: string;
    children: React.ReactNode;
    title?: string;
  }) => (
    <button
      onMouseDown={(e) => {
        e.preventDefault(); // Prevent losing focus from editor
        onApplyFormat(command, value);
      }}
      className="p-2 rounded transition-colors"
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="border-b border-gray-200 p-2 flex items-center space-x-2 flex-wrap gap-y-2">
      <ToolbarButton command="undo" title="Undo">
        <Undo className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton command="redo" title="Redo">
        <Redo className="w-4 h-4" />
      </ToolbarButton>

      <div className="border-r border-gray-200 mx-2 h-6" />

      <ToolbarButton command="bold" title="Bold">
        <Bold className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton command="italic" title="Italic">
        <Italic className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton command="underline" title="Underline">
        <Underline className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton command="strikeThrough" title="Strikethrough">
        <Strikethrough className="w-4 h-4" />
      </ToolbarButton>

      <div className="border-r border-gray-200 mx-2 h-6" />

      <ToolbarButton command="justifyLeft" title="Align Left">
        <AlignLeft className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton command="justifyCenter" title="Align Center">
        <AlignCenter className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton command="justifyRight" title="Align Right">
        <AlignRight className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton command="justifyFull" title="Justify">
        <AlignJustify className="w-4 h-4" />
      </ToolbarButton>
      <div className="flex space-x-2">
        <Select onValueChange={(value) => onApplyFormat("fontSize", value)}>
          <SelectTrigger
            className="border rounded p-1 text-sm w-[180px]"
            title="Font Size"
          >
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Tiny</SelectItem>
            <SelectItem value="2">Small</SelectItem>
            <SelectItem value="3">Normal</SelectItem>
            <SelectItem value="4">Large</SelectItem>
            <SelectItem value="5">Larger</SelectItem>
            <SelectItem value="6">X-Large</SelectItem>
            <SelectItem value="7">XX-Large</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => onApplyFormat("fontName", value)}>
          <SelectTrigger
            className="border rounded p-1 text-sm w-[180px]"
            title="Font Family"
          >
            <SelectValue placeholder="Font Family" />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ModeToggle />
      </div>
    </div>
  );
};

export default Toolbar;
