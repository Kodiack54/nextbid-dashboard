'use client';

import { useState, useEffect } from 'react';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

interface FileExplorerProps {
  project: { id: string; name: string; path: string };
  environment: { id: string; name: string; ip: string };
  onFileSelect: (path: string) => void;
  selectedFile: string | null;
}

// File icons based on extension
const getFileIcon = (name: string, type: 'file' | 'folder', isOpen?: boolean) => {
  if (type === 'folder') {
    return isOpen ? '📂' : '📁';
  }

  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
      return '🟨';
    case 'ts':
    case 'tsx':
      return '🔷';
    case 'json':
      return '📋';
    case 'md':
      return '📝';
    case 'css':
    case 'scss':
      return '🎨';
    case 'html':
      return '🌐';
    case 'env':
      return '🔐';
    case 'sql':
      return '🗃️';
    default:
      return '📄';
  }
};

function FileTreeItem({
  node,
  depth = 0,
  onFileSelect,
  selectedFile,
  expandedFolders,
  toggleFolder,
}: {
  node: FileNode;
  depth?: number;
  onFileSelect: (path: string) => void;
  selectedFile: string | null;
  expandedFolders: Set<string>;
  toggleFolder: (path: string) => void;
}) {
  const isExpanded = expandedFolders.has(node.path);
  const isSelected = selectedFile === node.path;

  const handleClick = () => {
    if (node.type === 'folder') {
      toggleFolder(node.path);
    } else {
      onFileSelect(node.path);
    }
  };

  return (
    <div>
      <div
        className={`
          flex items-center gap-1.5 px-2 py-1 cursor-pointer text-sm
          ${isSelected ? 'bg-blue-600/30 text-blue-300' : 'hover:bg-gray-700/50 text-gray-300'}
        `}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        {node.type === 'folder' && (
          <span className="text-gray-500 text-xs w-3">
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
        {node.type === 'file' && <span className="w-3" />}
        <span className="text-xs">{getFileIcon(node.name, node.type, isExpanded)}</span>
        <span className="truncate">{node.name}</span>
      </div>

      {node.type === 'folder' && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileExplorer({
  project,
  environment,
  onFileSelect,
  selectedFile,
}: FileExplorerProps) {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'src/app']));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch file tree from patcher API
  useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // TODO: Real API call to patcher
        // const response = await fetch(`/api/development/files?project=${project.id}&env=${environment.id}`);
        // const data = await response.json();
        // setFiles(data.files);

        // Mock data for now - showing typical Next.js project structure
        setFiles([
          {
            name: 'src',
            path: 'src',
            type: 'folder',
            children: [
              {
                name: 'app',
                path: 'src/app',
                type: 'folder',
                children: [
                  { name: 'page.tsx', path: 'src/app/page.tsx', type: 'file' },
                  { name: 'layout.tsx', path: 'src/app/layout.tsx', type: 'file' },
                  { name: 'globals.css', path: 'src/app/globals.css', type: 'file' },
                  {
                    name: 'development',
                    path: 'src/app/development',
                    type: 'folder',
                    children: [
                      { name: 'page.tsx', path: 'src/app/development/page.tsx', type: 'file' },
                      {
                        name: 'components',
                        path: 'src/app/development/components',
                        type: 'folder',
                        children: [
                          { name: 'FileExplorer.tsx', path: 'src/app/development/components/FileExplorer.tsx', type: 'file' },
                          { name: 'CodeEditor.tsx', path: 'src/app/development/components/CodeEditor.tsx', type: 'file' },
                          { name: 'TerminalPanel.tsx', path: 'src/app/development/components/TerminalPanel.tsx', type: 'file' },
                          { name: 'ClaudeChat.tsx', path: 'src/app/development/components/ClaudeChat.tsx', type: 'file' },
                        ],
                      },
                    ],
                  },
                  {
                    name: 'api',
                    path: 'src/app/api',
                    type: 'folder',
                    children: [
                      { name: 'route.ts', path: 'src/app/api/route.ts', type: 'file' },
                    ],
                  },
                ],
              },
              {
                name: 'components',
                path: 'src/components',
                type: 'folder',
                children: [
                  { name: 'Sidebar.tsx', path: 'src/components/Sidebar.tsx', type: 'file' },
                  { name: 'Header.tsx', path: 'src/components/Header.tsx', type: 'file' },
                ],
              },
            ],
          },
          { name: 'package.json', path: 'package.json', type: 'file' },
          { name: 'tsconfig.json', path: 'tsconfig.json', type: 'file' },
          { name: '.env', path: '.env', type: 'file' },
          { name: 'README.md', path: 'README.md', type: 'file' },
        ]);
      } catch (err) {
        setError('Failed to load files');
        console.error('Error fetching files:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, [project.id, environment.id]);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 text-gray-400 text-sm">
        Loading files...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-xs text-blue-400 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="py-1">
      <div className="px-3 py-1.5 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-700/50 mb-1">
        {project.name}
      </div>
      {files.map((node) => (
        <FileTreeItem
          key={node.path}
          node={node}
          onFileSelect={onFileSelect}
          selectedFile={selectedFile}
          expandedFolders={expandedFolders}
          toggleFolder={toggleFolder}
        />
      ))}
    </div>
  );
}
