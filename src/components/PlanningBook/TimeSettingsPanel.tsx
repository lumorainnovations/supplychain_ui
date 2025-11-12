import React, { useState } from 'react';
import { Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import { apiService } from '../../services/api';
import type { TimeSetting } from '../../types/planningBook';

interface TimeSettingsPanelProps {
  timeSettings: TimeSetting[];
  selectedTimeSetting: TimeSetting | null;
  onTimeSettingChange: (timeSetting: TimeSetting) => void;
  onRefresh: () => void;
}

const TimeSettingsPanel: React.FC<TimeSettingsPanelProps> = ({
  timeSettings,
  selectedTimeSetting,
  onTimeSettingChange,
  onRefresh
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingSetting, setEditingSetting] = useState<TimeSetting | null>(null);
  const [showHierarchyDropdown, setShowHierarchyDropdown] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'fixed' as 'fixed' | 'rolling',
    start_date: '',
    end_date: '',
    rolling_periods: 12,
    rolling_unit: 'month' as 'day' | 'week' | 'month' | 'quarter' | 'year',
    time_hierarchy: {
      day: true,
      week: true,
      month: true,
      quarter: true,
      year: true
    },
    is_active: true
  });

  // Helper function to convert date to YYYY-MM-DD format for HTML date input
  const formatDateForInput = (date: string | Date | undefined | null): string => {
    if (!date) return '';
    
    // If it's already a string in YYYY-MM-DD format
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    
    // If it's an ISO string (e.g., "2025-11-01T00:00:00.000Z")
    if (typeof date === 'string' && date.includes('T')) {
      return date.split('T')[0];
    }
    
    // If it's a Date object
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // Try to parse as date string
    try {
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      // Ignore parsing errors
    }
    
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSetting) {
        await apiService.updateTimeSetting(editingSetting.id, formData);
      } else {
        await apiService.createTimeSetting(formData);
      }
      setShowForm(false);
      setEditingSetting(null);
      onRefresh();
    } catch (error) {
      console.error('Failed to save time setting:', error);
      alert('Failed to save time setting');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Time Settings</h3>
        <button
          onClick={() => {
            setEditingSetting(null);
            setShowHierarchyDropdown(false);
            setFormData({
              name: '',
              type: 'fixed',
              start_date: '',
              end_date: '',
              rolling_periods: 12,
              rolling_unit: 'month',
              time_hierarchy: { day: true, week: true, month: true, quarter: true, year: true },
              is_active: true
            });
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Time Setting
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {timeSettings.map((setting) => (
          <div
            key={setting.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedTimeSetting?.id === setting.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onTimeSettingChange(setting)}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{setting.name}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {setting.type === 'fixed' ? 'Fixed Period' : 'Rolling Period'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDateForInput(setting.startDate) || 'N/A'} - {formatDateForInput(setting.endDate) || 'Ongoing'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSetting(setting);
                    // Ensure time_hierarchy is properly parsed and has defaults
                    let timeHierarchy = setting.timeHierarchy;
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
                    // Ensure all hierarchy levels exist with defaults
                    const defaultHierarchy = { day: true, week: true, month: true, quarter: true, year: true };
                    timeHierarchy = { ...defaultHierarchy, ...timeHierarchy };
                    
                    setFormData({
                      name: setting.name,
                      type: setting.type,
                      start_date: formatDateForInput(setting.startDate),
                      end_date: formatDateForInput(setting.endDate),
                      rolling_periods: setting.rollingPeriods || 12,
                      rolling_unit: setting.rollingUnit || 'month',
                      time_hierarchy: timeHierarchy,
                      is_active: setting.isActive ?? true
                    });
                    setShowHierarchyDropdown(false);
                    setShowForm(true);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingSetting ? 'Edit Time Setting' : 'New Time Setting'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'fixed' | 'rolling' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="fixed">Fixed</option>
                  <option value="rolling">Rolling</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              {formData.type === 'fixed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}
              {formData.type === 'rolling' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rolling Periods</label>
                    <input
                      type="number"
                      value={formData.rolling_periods}
                      onChange={(e) => setFormData({ ...formData, rolling_periods: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rolling Unit</label>
                    <select
                      value={formData.rolling_unit}
                      onChange={(e) => setFormData({ ...formData, rolling_unit: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="day">Day</option>
                      <option value="week">Week</option>
                      <option value="month">Month</option>
                      <option value="quarter">Quarter</option>
                      <option value="year">Year</option>
                    </select>
                  </div>
                </>
              )}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Hierarchy</label>
                <button
                  type="button"
                  onClick={() => setShowHierarchyDropdown(!showHierarchyDropdown)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left bg-white flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span className="text-gray-700">
                    {Object.keys(formData.time_hierarchy || {}).filter(
                      key => formData.time_hierarchy?.[key as keyof typeof formData.time_hierarchy]
                    ).map(key => key.charAt(0).toUpperCase() + key.slice(1)).join(', ') || 'Select hierarchy levels'}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${showHierarchyDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showHierarchyDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowHierarchyDropdown(false)}
                    ></div>
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      <div className="p-2 space-y-2">
                        {(['day', 'week', 'month', 'quarter', 'year'] as const).map((level) => (
                          <label key={level} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.time_hierarchy?.[level] ?? false}
                              onChange={(e) => {
                                setFormData({
                                  ...formData,
                                  time_hierarchy: {
                                    ...(formData.time_hierarchy || { day: false, week: false, month: false, quarter: false, year: false }),
                                    [level]: e.target.checked
                                  }
                                });
                              }}
                              className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="capitalize text-gray-700">{level}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSetting(null);
                    setShowHierarchyDropdown(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSettingsPanel;

