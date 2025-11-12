import React, { useState, useEffect } from 'react';
import { BookOpen, Settings, AlertTriangle, History, BarChart3 } from 'lucide-react';
import { apiService } from '../../services/api';
import type { PlanningVersion, TimeSetting, KeyFigure, Alert } from '../../types/planningBook';
import TimeSettingsPanel from './TimeSettingsPanel';
import PlanningGrid from './PlanningGrid';
import KeyFigureConfig from './KeyFigureConfig';
import AlertsPanel from './AlertsPanel';
import VersionSelector from './VersionSelector';
import ChartsView from './ChartsView';

const PlanningBookMain: React.FC = () => {
  const [activeView, setActiveView] = useState<'grid' | 'settings' | 'key-figures' | 'alerts' | 'charts'>('grid');
  const [selectedVersion, setSelectedVersion] = useState<PlanningVersion | null>(null);
  const [selectedTimeSetting, setSelectedTimeSetting] = useState<TimeSetting | null>(null);
  const [versions, setVersions] = useState<PlanningVersion[]>([]);
  const [timeSettings, setTimeSettings] = useState<TimeSetting[]>([]);
  const [keyFigures, setKeyFigures] = useState<KeyFigure[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedVersion) {
      loadAlerts();
    }
  }, [selectedVersion]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [versionsRes, timeSettingsRes, keyFiguresRes] = await Promise.all([
        apiService.getVersions(),
        apiService.getTimeSettings({ active_only: 'true' }),
        apiService.getKeyFigures({ active_only: 'true' })
      ]);

      setVersions(versionsRes.versions || []);
      
      // Transform time settings from snake_case to camelCase
      const transformedTimeSettings = (timeSettingsRes.settings || []).map((setting: any) => {
        let timeHierarchy = setting.time_hierarchy;
        if (typeof timeHierarchy === 'string') {
          try {
            timeHierarchy = JSON.parse(timeHierarchy);
          } catch (e) {
            timeHierarchy = { day: true, week: true, month: true, quarter: true, year: true };
          }
        }
        if (!timeHierarchy || typeof timeHierarchy !== 'object') {
          timeHierarchy = { day: true, week: true, month: true, quarter: true, year: true };
        }
        
        return {
          id: setting.id,
          name: setting.name,
          type: setting.type,
          startDate: setting.start_date,
          endDate: setting.end_date,
          rollingPeriods: setting.rolling_periods,
          rollingUnit: setting.rolling_unit,
          timeHierarchy: timeHierarchy,
          isActive: setting.is_active,
          createdBy: setting.created_by,
          createdAt: setting.created_at,
          updatedAt: setting.updated_at
        };
      });
      setTimeSettings(transformedTimeSettings);
      setKeyFigures(keyFiguresRes.keyFigures || []);

      // Set defaults
      if (versionsRes.versions && versionsRes.versions.length > 0) {
        setSelectedVersion(versionsRes.versions[0]);
      }
      if (transformedTimeSettings.length > 0) {
        setSelectedTimeSetting(transformedTimeSettings[0]);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    if (!selectedVersion) return;
    try {
      const response = await apiService.getUnresolvedAlerts({ version_id: selectedVersion.id });
      setAlerts(response.alerts || []);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const handleVersionChange = (version: PlanningVersion) => {
    setSelectedVersion(version);
  };

  const handleTimeSettingChange = (timeSetting: TimeSetting) => {
    setSelectedTimeSetting(timeSetting);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Planning Book...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <BookOpen className="w-6 h-6 mr-2" />
              Planning Book
            </h2>
            <p className="text-gray-600 mt-1">SAP-like planning and forecasting system</p>
          </div>
          <VersionSelector
            versions={versions}
            selectedVersion={selectedVersion}
            onVersionChange={handleVersionChange}
            onRefresh={loadInitialData}
          />
        </div>
      </div>

      {/* View Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'grid', name: 'Planning Grid', icon: BarChart3 },
              { id: 'settings', name: 'Time Settings', icon: Settings },
              { id: 'key-figures', name: 'Key Figures', icon: BookOpen },
              { id: 'alerts', name: 'Alerts', icon: AlertTriangle, badge: alerts.length },
              { id: 'charts', name: 'Charts', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as any)}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeView === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeView === 'grid' && (
            <PlanningGrid
              version={selectedVersion}
              timeSetting={selectedTimeSetting}
              keyFigures={keyFigures}
              onRefresh={loadInitialData}
            />
          )}
          {activeView === 'settings' && (
            <TimeSettingsPanel
              timeSettings={timeSettings}
              selectedTimeSetting={selectedTimeSetting}
              onTimeSettingChange={handleTimeSettingChange}
              onRefresh={loadInitialData}
            />
          )}
          {activeView === 'key-figures' && (
            <KeyFigureConfig
              keyFigures={keyFigures}
              onRefresh={loadInitialData}
            />
          )}
          {activeView === 'alerts' && (
            <AlertsPanel
              version={selectedVersion}
              alerts={alerts}
              onRefresh={loadAlerts}
            />
          )}
          {activeView === 'charts' && (
            <ChartsView
              version={selectedVersion}
              timeSetting={selectedTimeSetting}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanningBookMain;

