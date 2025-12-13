'use client';

import { useState } from 'react';

interface DeploymentBarProps {
  project: { id: string; name: string; path: string };
  currentEnv: { id: string; name: string; ip: string; readOnly?: boolean };
  onEnvChange: (env: any) => void;
}

interface BuildInfo {
  number: number;
  commit: string;
  message: string;
  timestamp: Date;
  author: string;
}

export default function DeploymentBar({
  project,
  currentEnv,
  onEnvChange,
}: DeploymentBarProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [showRollbackModal, setShowRollbackModal] = useState(false);

  // Mock build info - would come from patcher API
  const builds: Record<string, BuildInfo> = {
    dev: {
      number: 249,
      commit: 'abc1234',
      message: 'Add development tab layout',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
      author: 'Michael',
    },
    test: {
      number: 247,
      commit: 'def5678',
      message: 'Fix auth token flow',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      author: 'Michael',
    },
    prod: {
      number: 245,
      commit: 'ghi9012',
      message: 'Role-based permissions',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      author: 'Michael',
    },
  };

  const currentBuild = builds[currentEnv.id] || builds.dev;

  const handleGitPull = async () => {
    setIsPulling(true);
    try {
      // TODO: Real API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Git pull completed');
    } catch (error) {
      console.error('Git pull failed:', error);
    } finally {
      setIsPulling(false);
    }
  };

  const handleGitPush = async () => {
    setIsPushing(true);
    try {
      // TODO: Real API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Git push completed');
    } catch (error) {
      console.error('Git push failed:', error);
    } finally {
      setIsPushing(false);
    }
  };

  const handlePromote = async (from: string, to: string) => {
    setIsDeploying(true);
    try {
      // TODO: Real API call
      await new Promise((resolve) => setTimeout(resolve, 3000));
      console.log(`Promoted from ${from} to ${to}`);
    } catch (error) {
      console.error('Promotion failed:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleRollback = async (buildNumber: number) => {
    setIsDeploying(true);
    try {
      // TODO: Real API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log(`Rolled back to build #${buildNumber}`);
      setShowRollbackModal(false);
    } catch (error) {
      console.error('Rollback failed:', error);
    } finally {
      setIsDeploying(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <>
      <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Pipeline Visual */}
          <div className="flex items-center gap-2">
            {/* DEV */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded ${currentEnv.id === 'dev' ? 'bg-blue-600/30 border border-blue-500' : 'bg-gray-700'}`}>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div>
                <div className="text-xs text-gray-400">DEV</div>
                <div className="text-sm text-white font-mono">#{builds.dev.number}</div>
              </div>
            </div>

            {/* Arrow DEV → TEST */}
            <button
              onClick={() => handlePromote('dev', 'test')}
              disabled={isDeploying || currentEnv.id === 'prod'}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded transition-colors"
              title="Promote DEV to TEST"
            >
              <span>→</span>
              <span className="hidden sm:inline">Test</span>
            </button>

            {/* TEST */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded ${currentEnv.id === 'test' ? 'bg-yellow-600/30 border border-yellow-500' : 'bg-gray-700'}`}>
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div>
                <div className="text-xs text-gray-400">TEST</div>
                <div className="text-sm text-white font-mono">#{builds.test.number}</div>
              </div>
            </div>

            {/* Arrow TEST → PROD */}
            <button
              onClick={() => handlePromote('test', 'prod')}
              disabled={isDeploying}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-orange-600 disabled:opacity-50 rounded transition-colors"
              title="Promote TEST to PROD (requires Lead+)"
            >
              <span>→</span>
              <span className="hidden sm:inline">Prod</span>
            </button>

            {/* PROD */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded ${currentEnv.id === 'prod' ? 'bg-green-600/30 border border-green-500' : 'bg-gray-700'}`}>
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <div>
                <div className="text-xs text-gray-400">PROD</div>
                <div className="text-sm text-white font-mono">#{builds.prod.number}</div>
              </div>
            </div>
          </div>

          {/* Current Build Info */}
          <div className="flex items-center gap-4 text-sm">
            <div className="hidden md:block text-gray-400">
              <span className="text-cyan-400 font-mono">{currentBuild.commit}</span>
              <span className="mx-2">•</span>
              <span className="text-gray-300">{currentBuild.message}</span>
              <span className="mx-2">•</span>
              <span>{formatTimeAgo(currentBuild.timestamp)}</span>
            </div>

            {/* Git Operations */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleGitPull}
                disabled={isPulling || currentEnv.readOnly}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white text-xs rounded transition-colors"
              >
                {isPulling ? (
                  <span className="animate-spin">↻</span>
                ) : (
                  <span>↓</span>
                )}
                Pull
              </button>

              <button
                onClick={handleGitPush}
                disabled={isPushing || currentEnv.readOnly}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white text-xs rounded transition-colors"
              >
                {isPushing ? (
                  <span className="animate-spin">↻</span>
                ) : (
                  <span>↑</span>
                )}
                Push
              </button>

              <button
                onClick={() => setShowRollbackModal(true)}
                disabled={isDeploying}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600/50 hover:bg-red-600 disabled:opacity-50 text-white text-xs rounded transition-colors"
              >
                ↩ Rollback
              </button>
            </div>
          </div>
        </div>

        {/* Deploying Indicator */}
        {isDeploying && (
          <div className="mt-2 flex items-center gap-2 text-yellow-400 text-sm">
            <span className="animate-spin">⏳</span>
            <span>Deploying...</span>
            <div className="flex-1 h-1 bg-gray-700 rounded overflow-hidden">
              <div className="h-full bg-yellow-400 animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Rollback Modal */}
      {showRollbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Rollback {currentEnv.name}</h3>

            <p className="text-gray-400 text-sm mb-4">
              Select a previous build to rollback to. This will replace the current deployment.
            </p>

            <div className="space-y-2 mb-6">
              {[currentBuild.number - 1, currentBuild.number - 2, currentBuild.number - 3].map((num) => (
                <button
                  key={num}
                  onClick={() => handleRollback(num)}
                  disabled={isDeploying}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-400 font-mono">#{num}</span>
                    <span className="text-gray-300">Previous build</span>
                  </div>
                  <span className="text-gray-500 text-sm">{num === currentBuild.number - 1 ? '2h ago' : num === currentBuild.number - 2 ? '1d ago' : '3d ago'}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRollbackModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
