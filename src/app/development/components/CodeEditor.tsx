'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface CodeEditorProps {
  content: string;
  onChange: (content: string) => void;
  language: string;
  readOnly?: boolean;
}

// Language mapping for syntax highlighting
const LANGUAGE_MAP: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  json: 'json',
  md: 'markdown',
  css: 'css',
  scss: 'scss',
  html: 'html',
  sql: 'sql',
  sh: 'shell',
  bash: 'shell',
  env: 'plaintext',
};

// Simple syntax highlighting for display
// In production, use Monaco Editor or CodeMirror
function highlightSyntax(code: string, language: string): string {
  // Basic keyword highlighting
  const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'import', 'export', 'from', 'default', 'async', 'await', 'class', 'extends', 'new', 'this', 'try', 'catch', 'throw', 'typeof', 'interface', 'type'];
  const builtins = ['console', 'require', 'module', 'process', 'window', 'document', 'Promise', 'Array', 'Object', 'String', 'Number', 'Boolean', 'null', 'undefined', 'true', 'false'];

  let highlighted = code
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (language === 'javascript' || language === 'typescript') {
    // Strings (single and double quotes)
    highlighted = highlighted.replace(/(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g, '<span class="text-green-400">$&</span>');
    // Comments
    highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="text-gray-500">$1</span>');
    highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500">$1</span>');
    // Keywords
    keywords.forEach(kw => {
      highlighted = highlighted.replace(new RegExp(`\\b(${kw})\\b`, 'g'), '<span class="text-purple-400">$1</span>');
    });
    // Built-ins
    builtins.forEach(bi => {
      highlighted = highlighted.replace(new RegExp(`\\b(${bi})\\b`, 'g'), '<span class="text-cyan-400">$1</span>');
    });
    // Numbers
    highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="text-orange-400">$1</span>');
  }

  return highlighted;
}

export default function CodeEditor({
  content,
  onChange,
  language,
  readOnly = false,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineCount, setLineCount] = useState(1);
  const mappedLanguage = LANGUAGE_MAP[language] || language;

  useEffect(() => {
    const lines = content.split('\n').length;
    setLineCount(Math.max(lines, 20));
  }, [content]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      // Trigger save
      console.log('Save triggered');
    }

    // Tab key handling
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      onChange(newContent);
      // Move cursor after the tab
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  }, [content, onChange]);

  if (!content) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📄</div>
          <p>Select a file to edit</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-gray-900 font-mono text-sm overflow-hidden">
      {/* Line Numbers */}
      <div className="flex-shrink-0 bg-gray-850 border-r border-gray-700 text-gray-500 text-right select-none overflow-hidden">
        <div className="px-3 py-2">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1} className="leading-6 h-6">
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Code Area */}
      <div className="flex-1 relative overflow-auto">
        {readOnly ? (
          // Read-only display with syntax highlighting
          <pre className="p-2 leading-6 text-gray-300 whitespace-pre overflow-x-auto">
            <code dangerouslySetInnerHTML={{ __html: highlightSyntax(content, mappedLanguage) }} />
          </pre>
        ) : (
          // Editable textarea
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="absolute inset-0 w-full h-full p-2 bg-transparent text-gray-300 resize-none outline-none leading-6 whitespace-pre overflow-auto"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
          />
        )}
      </div>

      {/* Language indicator */}
      <div className="absolute bottom-2 right-4 text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
        {mappedLanguage}
        {readOnly && ' (read-only)'}
      </div>
    </div>
  );
}
