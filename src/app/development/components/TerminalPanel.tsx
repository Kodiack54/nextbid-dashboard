'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface TerminalTab {
  id: string;
  name: string;
  type: 'ssh' | 'local' | 'build';
  host?: string;
  history: TerminalLine[];
  cwd: string;
}

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'info';
  content: string;
  timestamp: Date;
}

interface TerminalPanelProps {
  environment: { id: string; name: string; ip: string };
  project: { id: string; name: string; path: string };
}

// Quick command presets
const QUICK_COMMANDS = [
  { label: 'PM2 List', cmd: 'pm2 list' },
  { label: 'PM2 Logs', cmd: 'pm2 logs --lines 50' },
  { label: 'Git Status', cmd: 'git status' },
  { label: 'Git Pull', cmd: 'git pull' },
  { label: 'NPM Install', cmd: 'npm install' },
  { label: 'NPM Build', cmd: 'npm run build' },
];

export default function TerminalPanel({
  environment,
  project,
}: TerminalPanelProps) {
  const [tabs, setTabs] = useState<TerminalTab[]>([
    {
      id: 'ssh-1',
      name: `${environment.name}`,
      type: 'ssh',
      host: environment.ip,
      history: [
        {
          type: 'info',
          content: `Connected to ${environment.ip} (${environment.name})`,
          timestamp: new Date(),
        },
        {
          type: 'info',
          content: `Working directory: ${project.path}`,
          timestamp: new Date(),
        },
        {
          type: 'output',
          content: '',
          timestamp: new Date(),
        },
      ],
      cwd: project.path,
    },
  ]);
  const [activeTab, setActiveTab] = useState('ssh-1');
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const currentTab = tabs.find((t) => t.id === activeTab);

  // Auto-scroll to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [currentTab?.history]);

  // Focus input on click
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  // Execute command
  const executeCommand = async (cmd: string) => {
    if (!cmd.trim() || isExecuting) return;

    // Add to history
    setCommandHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);

    // Add input line
    addLine('input', `$ ${cmd}`);
    setInput('');
    setIsExecuting(true);

    try {
      // TODO: Real API call to patcher to execute SSH command
      // const response = await fetch('/api/development/execute', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     command: cmd,
      //     host: environment.ip,
      //     cwd: project.path,
      //   }),
      // });
      // const data = await response.json();
      // addLine(data.error ? 'error' : 'output', data.output);

      // Mock responses for common commands
      let output = '';
      const cmdLower = cmd.toLowerCase().trim();

      if (cmdLower === 'pm2 list') {
        output = `┌─────┬──────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┐
│ id  │ name         │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │
├─────┼──────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┤
│ 0   │ auth         │ default     │ 1.0.0   │ fork    │ 12345    │ 2d     │ 0    │ online    │ 0.1%     │
│ 1   │ slot-06      │ default     │ 1.0.0   │ fork    │ 12346    │ 5h     │ 2    │ online    │ 2.3%     │
└─────┴──────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┘`;
      } else if (cmdLower === 'git status') {
        output = `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
        modified:   server.js

no changes added to commit (use "git add" and/or "git commit -a")`;
      } else if (cmdLower === 'ls' || cmdLower === 'ls -la') {
        output = `total 156
drwxr-xr-x  8 root root  4096 Dec 13 10:00 .
drwxr-xr-x  5 root root  4096 Dec 12 08:00 ..
-rw-r--r--  1 root root   245 Dec 13 09:30 .env
drwxr-xr-x  8 root root  4096 Dec 13 09:00 .git
-rw-r--r--  1 root root  1234 Dec 12 14:00 package.json
-rw-r--r--  1 root root 45678 Dec 12 14:00 package-lock.json
-rw-r--r--  1 root root  8901 Dec 13 09:30 server.js
drwxr-xr-x  4 root root  4096 Dec 12 08:00 src`;
      } else if (cmdLower === 'pwd') {
        output = project.path;
      } else if (cmdLower.startsWith('cd ')) {
        output = ''; // Silent success for cd
      } else if (cmdLower === 'clear' || cmdLower === 'cls') {
        clearTerminal();
        setIsExecuting(false);
        return;
      } else if (cmdLower === 'help') {
        output = `Available commands:
  pm2 list          - Show running processes
  pm2 logs          - Show PM2 logs
  pm2 restart <app> - Restart an application
  pm2 stop <app>    - Stop an application
  pm2 start <app>   - Start an application
  git status        - Show git status
  git pull          - Pull latest changes
  git push          - Push changes
  npm install       - Install dependencies
  npm run build     - Build the project
  ls                - List files
  pwd               - Print working directory
  clear             - Clear terminal`;
      } else {
        output = `Command executed: ${cmd}\n(Real execution requires patcher API connection)`;
      }

      addLine('output', output);
    } catch (error) {
      addLine('error', `Error: ${error instanceof Error ? error.message : 'Command failed'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const addLine = (type: TerminalLine['type'], content: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTab
          ? {
              ...tab,
              history: [
                ...tab.history,
                { type, content, timestamp: new Date() },
              ],
            }
          : tab
      )
    );
  };

  const clearTerminal = () => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTab
          ? {
              ...tab,
              history: [
                {
                  type: 'info',
                  content: 'Terminal cleared',
                  timestamp: new Date(),
                },
              ],
            }
          : tab
      )
    );
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      clearTerminal();
    }
  };

  // Add new tab
  const addTab = (type: 'ssh' | 'local' | 'build') => {
    const newId = `${type}-${Date.now()}`;
    const newTab: TerminalTab = {
      id: newId,
      name: type === 'ssh' ? environment.name : type === 'local' ? 'Local' : 'Build',
      type,
      host: type === 'ssh' ? environment.ip : undefined,
      history: [
        {
          type: 'info',
          content: type === 'ssh'
            ? `Connected to ${environment.ip}`
            : type === 'build'
            ? 'Build terminal ready'
            : 'Local terminal ready',
          timestamp: new Date(),
        },
      ],
      cwd: project.path,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTab(newId);
  };

  // Close tab
  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return; // Don't close last tab
    setTabs((prev) => prev.filter((t) => t.id !== tabId));
    if (activeTab === tabId) {
      setActiveTab(tabs[0].id === tabId ? tabs[1]?.id : tabs[0].id);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900" onClick={handleContainerClick}>
      {/* Tab Bar */}
      <div className="flex items-center bg-gray-800 border-b border-gray-700 px-1">
        <div className="flex-1 flex items-center gap-0.5 overflow-x-auto">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`
                flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer
                ${activeTab === tab.id
                  ? 'bg-gray-900 text-white border-t border-x border-gray-700 rounded-t'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }
              `}
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab(tab.id);
              }}
            >
              <span className={tab.type === 'ssh' ? 'text-green-400' : tab.type === 'build' ? 'text-yellow-400' : 'text-blue-400'}>
                {tab.type === 'ssh' ? '⚡' : tab.type === 'build' ? '🔨' : '💻'}
              </span>
              <span>{tab.name}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="ml-1 text-gray-500 hover:text-white"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Tab Button */}
        <div className="flex items-center gap-1 px-2">
          <button
            onClick={() => addTab('ssh')}
            className="p-1 text-gray-500 hover:text-white text-xs"
            title="New SSH Tab"
          >
            + SSH
          </button>
          <button
            onClick={() => addTab('build')}
            className="p-1 text-gray-500 hover:text-white text-xs"
            title="New Build Tab"
          >
            + Build
          </button>
        </div>
      </div>

      {/* Quick Commands */}
      <div className="flex items-center gap-1 px-2 py-1 bg-gray-850 border-b border-gray-700 overflow-x-auto">
        {QUICK_COMMANDS.map((qc) => (
          <button
            key={qc.cmd}
            onClick={() => executeCommand(qc.cmd)}
            className="px-2 py-0.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded whitespace-nowrap transition-colors"
          >
            {qc.label}
          </button>
        ))}
      </div>

      {/* Terminal Output */}
      <div
        ref={outputRef}
        className="flex-1 p-2 overflow-auto font-mono text-sm leading-5"
      >
        {currentTab?.history.map((line, i) => (
          <div
            key={i}
            className={`
              whitespace-pre-wrap break-all
              ${line.type === 'input' ? 'text-cyan-400' : ''}
              ${line.type === 'output' ? 'text-gray-300' : ''}
              ${line.type === 'error' ? 'text-red-400' : ''}
              ${line.type === 'info' ? 'text-yellow-400 italic' : ''}
            `}
          >
            {line.content}
          </div>
        ))}

        {/* Input Line */}
        <div className="flex items-center text-cyan-400">
          <span className="mr-2">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isExecuting}
            className="flex-1 bg-transparent outline-none text-white"
            placeholder={isExecuting ? 'Executing...' : 'Enter command...'}
            autoFocus
          />
          {isExecuting && (
            <span className="text-yellow-400 animate-pulse ml-2">⏳</span>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-gray-800 border-t border-gray-700 text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Connected
          </span>
          <span>{currentTab?.host || 'Local'}</span>
        </div>
        <div>
          {currentTab?.cwd}
        </div>
      </div>
    </div>
  );
}
