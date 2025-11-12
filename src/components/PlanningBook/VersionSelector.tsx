import React, { useState } from 'react';
import { ChevronDown, Plus, Copy, Lock, Unlock, RefreshCw } from 'lucide-react';
import { apiService } from '../../services/api';
import type { PlanningVersion } from '../../types/planningBook';

interface VersionSelectorProps {
  versions: PlanningVersion[];
  selectedVersion: PlanningVersion | null;
  onVersionChange: (version: PlanningVersion) => void;
  onRefresh: () => void;
}

const VersionSelector: React.FC<VersionSelectorProps> = ({
  versions,
  selectedVersion,
  onVersionChange,
  onRefresh
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');

  const handleCreateVersion = async () => {
    if (!newVersionName.trim()) return;
    try {
      await apiService.createVersion({ name: newVersionName });
      setShowCreateModal(false);
      setNewVersionName('');
      onRefresh();
    } catch (error) {
      console.error('Failed to create version:', error);
      alert('Failed to create version');
    }
  };

  const handleCopyVersion = async (version: PlanningVersion) => {
    try {
      await apiService.copyVersion(version.id, { name: `${version.name} (Copy)` });
      onRefresh();
    } catch (error) {
      console.error('Failed to copy version:', error);
      alert('Failed to copy version');
    }
  };

  const handleLockToggle = async (version: PlanningVersion) => {
    try {
      if (version.status === 'locked') {
        await apiService.unlockVersion(version.id);
      } else {
        await apiService.lockVersion(version.id);
      }
      onRefresh();
    } catch (error) {
      console.error('Failed to toggle lock:', error);
      alert('Failed to toggle lock');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'locked': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <span className="mr-2">
          {selectedVersion ? selectedVersion.name : 'Select Version'}
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Versions</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(true);
                    setIsOpen(false);
                  }}
                  className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    selectedVersion?.id === version.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    onVersionChange(version);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{version.name}</div>
                      {version.description && (
                        <div className="text-sm text-gray-500 mt-1">{version.description}</div>
                      )}
                      <div className="flex items-center mt-2 space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(version.status)}`}>
                          {version.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyVersion(version);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Copy version"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLockToggle(version);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title={version.status === 'locked' ? 'Unlock' : 'Lock'}
                      >
                        {version.status === 'locked' ? (
                          <Unlock className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Create New Version</h3>
            <input
              type="text"
              value={newVersionName}
              onChange={(e) => setNewVersionName(e.target.value)}
              placeholder="Version name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewVersionName('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateVersion}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionSelector;



