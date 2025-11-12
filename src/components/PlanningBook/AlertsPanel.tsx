import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Filter, RefreshCw } from 'lucide-react';
import { apiService } from '../../services/api';
import type { PlanningVersion, Alert } from '../../types/planningBook';

interface AlertsPanelProps {
  version: PlanningVersion | null;
  alerts: Alert[];
  onRefresh: () => void;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ version, alerts, onRefresh }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const handleResolve = async (alertId: string) => {
    try {
      await apiService.resolveAlert(alertId);
      onRefresh();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      alert('Failed to resolve alert');
    }
  };

  const handleEvaluate = async () => {
    if (!version) return;
    try {
      await apiService.evaluateAlerts({ version_id: version.id });
      onRefresh();
    } catch (error) {
      console.error('Failed to evaluate alerts:', error);
      alert('Failed to evaluate alerts');
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    if (filterType !== 'all' && alert.alertType !== filterType) return false;
    return true;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'error': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'shortage': return 'text-red-600';
      case 'excess': return 'text-orange-600';
      case 'exception': return 'text-yellow-600';
      case 'threshold': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Alerts & Exceptions</h3>
        <div className="flex items-center space-x-2">
          {version && (
            <button
              onClick={handleEvaluate}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Evaluate Alerts
            </button>
          )}
          <button
            onClick={onRefresh}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Types</option>
          <option value="shortage">Shortage</option>
          <option value="excess">Excess</option>
          <option value="exception">Exception</option>
          <option value="threshold">Threshold</option>
        </select>
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
          <p>No alerts found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 border rounded-lg ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className={`font-medium capitalize ${getTypeColor(alert.alertType)}`}>
                      {alert.alertType}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/50">
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{alert.message}</p>
                  <div className="text-xs opacity-75">
                    Period: {alert.timePeriod}
                    {alert.actualValue !== undefined && (
                      <span className="ml-4">Value: {alert.actualValue.toLocaleString()}</span>
                    )}
                    {alert.thresholdValue !== undefined && (
                      <span className="ml-4">Threshold: {alert.thresholdValue.toLocaleString()}</span>
                    )}
                  </div>
                </div>
                {!alert.isResolved && (
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="ml-4 px-3 py-1 bg-white text-gray-700 rounded text-sm hover:bg-gray-50"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;



