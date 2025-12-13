'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ClaudeChatProps {
  selectedFile: string | null;
  fileContent: string;
  project: { id: string; name: string; path: string };
}

// Quick prompts for common development tasks
const QUICK_PROMPTS = [
  { label: 'Explain', prompt: 'Explain this code:' },
  { label: 'Review', prompt: 'Review this code for bugs and improvements:' },
  { label: 'Refactor', prompt: 'Suggest how to refactor this code:' },
  { label: 'Document', prompt: 'Add documentation comments to this code:' },
  { label: 'Test', prompt: 'Write unit tests for this code:' },
];

export default function ClaudeChat({
  selectedFile,
  fileContent,
  project,
}: ClaudeChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm Claude, your AI coding assistant. I can help you with:

• **Code review** - Find bugs and suggest improvements
• **Explanations** - Understand complex code
• **Refactoring** - Improve code structure
• **Documentation** - Add comments and docs
• **Testing** - Write unit tests

Select a file and ask me anything!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build context with file content if available
      const context = selectedFile && fileContent
        ? `\n\nCurrent file: ${selectedFile}\n\`\`\`\n${fileContent.slice(0, 3000)}\n\`\`\``
        : '';

      // TODO: Real API call to Anthropic
      // const response = await fetch('/api/development/claude', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     message: content + context,
      //     history: messages.slice(-10), // Last 10 messages for context
      //   }),
      // });
      // const data = await response.json();

      // Mock response for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      let assistantContent = '';

      if (content.toLowerCase().includes('explain')) {
        assistantContent = `Looking at the code${selectedFile ? ` in ${selectedFile}` : ''}:

This appears to be a React/Next.js component. Here's what it does:

1. **State Management**: Uses React hooks (useState, useEffect) to manage component state
2. **Props Interface**: Accepts configuration through TypeScript interfaces
3. **Rendering**: Returns JSX with Tailwind CSS classes for styling

The pattern follows modern React best practices with functional components and hooks.

Would you like me to explain any specific part in more detail?`;
      } else if (content.toLowerCase().includes('review')) {
        assistantContent = `Code Review${selectedFile ? ` for ${selectedFile}` : ''}:

**✅ Good Practices:**
- Clean component structure
- Proper TypeScript typing
- Good separation of concerns

**⚠️ Suggestions:**
1. Consider memoizing callbacks with \`useCallback\` to prevent unnecessary re-renders
2. Add error boundaries for better error handling
3. Consider extracting magic strings to constants

**🐛 Potential Issues:**
- None critical found in this snippet

Would you like me to elaborate on any of these points?`;
      } else if (content.toLowerCase().includes('test')) {
        assistantContent = `Here's a test structure for this component:

\`\`\`typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders without crashing', () => {
    render(<ComponentName />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    render(<ComponentName />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Expected Result')).toBeInTheDocument();
  });
});
\`\`\`

Would you like me to add more specific test cases?`;
      } else {
        assistantContent = `I'd be happy to help with that! ${selectedFile ? `I can see you're working on \`${selectedFile}\`.` : 'Select a file to give me more context.'}

To give you the best assistance, could you:
1. Tell me more about what you're trying to accomplish
2. Share any specific error messages you're seeing
3. Describe the expected vs actual behavior

I'm here to help with code review, explanations, refactoring, documentation, or any other development tasks!`;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error. Please try again.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    const fullPrompt = selectedFile
      ? `${prompt}\n\nFile: ${selectedFile}`
      : prompt;
    sendMessage(fullPrompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[90%] rounded-lg px-3 py-2 text-sm
                ${message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-200 border border-gray-700'
                }
              `}
            >
              {/* Simple markdown rendering */}
              <div className="prose prose-invert prose-sm max-w-none">
                {message.content.split('\n').map((line, i) => {
                  // Code blocks
                  if (line.startsWith('```')) {
                    return null; // Handle in a more sophisticated way if needed
                  }
                  // Bold
                  const boldProcessed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                  // Inline code
                  const codeProcessed = boldProcessed.replace(/`(.*?)`/g, '<code class="bg-gray-700 px-1 rounded text-cyan-400">$1</code>');

                  return (
                    <p
                      key={i}
                      className="mb-1 last:mb-0"
                      dangerouslySetInnerHTML={{ __html: codeProcessed || '&nbsp;' }}
                    />
                  );
                })}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 text-gray-400">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-sm">Claude is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-t border-gray-700 overflow-x-auto">
        {QUICK_PROMPTS.map((qp) => (
          <button
            key={qp.label}
            onClick={() => handleQuickPrompt(qp.prompt)}
            disabled={isLoading}
            className="px-2 py-0.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded whitespace-nowrap transition-colors disabled:opacity-50"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* File Context Indicator */}
      {selectedFile && (
        <div className="px-3 py-1 bg-gray-800 border-t border-gray-700 text-xs">
          <span className="text-gray-500">Context:</span>
          <span className="text-cyan-400 ml-1">{selectedFile}</span>
        </div>
      )}

      {/* Input */}
      <div className="p-2 border-t border-gray-700">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Claude about your code... (Enter to send, Shift+Enter for newline)"
            disabled={isLoading}
            rows={2}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
