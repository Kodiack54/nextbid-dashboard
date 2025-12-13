'use client';

import { useEffect } from 'react';
import { useUser, useMinRole } from '../settings/UserContext';

export default function DevelopmentRedirectPage() {
  const { user, isLoading } = useUser();
  const hasAccess = useMinRole('engineer');

  useEffect(() => {
    if (!isLoading && user && hasAccess) {
      // Encode user data for the dev environment
      const userData = encodeURIComponent(JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }));

      // Open dev environment in new tab with user data
      window.open(`http://localhost:7501?user=${userData}`, '_blank');
    }
  }, [isLoading, user, hasAccess]);

  // Access check
  if (!isLoading && !hasAccess) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="bg-gray-800 border border-red-500/50 rounded-xl p-8 text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-white mb-2">Access Restricted</h2>
          <p className="text-gray-400">Engineer+ access required for the Dev Environment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center max-w-md">
        <div className="text-5xl mb-4">🛠️</div>
        <h2 className="text-xl font-semibold text-white mb-2">Dev Environment</h2>
        <p className="text-gray-400 mb-6">
          The Development Environment runs on a separate server to keep the dashboard fast.
        </p>

        <div className="space-y-3">
          <a
            href="http://localhost:7501"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Open Dev Environment
          </a>

          <p className="text-xs text-gray-500">
            Port 7501 · Claude AI · Project Locking · AI Cost Tracking
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Quick Links</h3>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="/dev-controls/releases"
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg"
            >
              Push / Pull
            </a>
            <a
              href="/dev-controls/deploy"
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg"
            >
              Deploy
            </a>
            <a
              href="/servers/tradelines"
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg"
            >
              Servers
            </a>
            <a
              href="/credentials"
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg"
            >
              Credentials
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
