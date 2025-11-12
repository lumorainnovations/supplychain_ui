import React from 'react';
import { Zap, CheckCircle, Clock, AlertCircle, Settings, ExternalLink } from 'lucide-react';

const Integration: React.FC = () => {
  const integrations = [
    {
      id: '1',
      name: 'Odoo ERP',
      description: 'Full ERP integration for seamless data synchronization',
      status: 'connected',
      lastSync: '2024-01-20 10:30 AM',
      type: 'ERP',
      logo: 'O'
    },
    {
      id: '2',
      name: 'SAP Business One',
      description: 'Enterprise resource planning integration',
      status: 'pending',
      lastSync: null,
      type: 'ERP',
      logo: 'S'
    },
    {
      id: '3',
      name: 'Salesforce CRM',
      description: 'Customer relationship management integration',
      status: 'connected',
      lastSync: '2024-01-20 09:15 AM',
      type: 'CRM',
      logo: 'SF'
    },
    {
      id: '4',
      name: 'QuickBooks',
      description: 'Financial data and accounting integration',
      status: 'error',
      lastSync: '2024-01-19 11:45 AM',
      type: 'Finance',
      logo: 'QB'
    },
    {
      id: '5',
      name: 'Shopify',
      description: 'E-commerce platform integration',
      status: 'connected',
      lastSync: '2024-01-20 10:00 AM',
      type: 'E-commerce',
      logo: 'S'
    },
    {
      id: '6',
      name: 'Amazon AWS',
      description: 'Cloud services and data storage',
      status: 'connected',
      lastSync: '2024-01-20 10:25 AM',
      type: 'Cloud',
      logo: 'AWS'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ERP':
        return 'bg-blue-100 text-blue-800';
      case 'CRM':
        return 'bg-purple-100 text-purple-800';
      case 'Finance':
        return 'bg-green-100 text-green-800';
      case 'E-commerce':
        return 'bg-orange-100 text-orange-800';
      case 'Cloud':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const pendingCount = integrations.filter(i => i.status === 'pending').length;
  const errorCount = integrations.filter(i => i.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">System Integrations</h2>
            <p className="text-gray-600 mt-1">Connect and manage external systems and data sources</p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Add Integration
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Sync All
            </button>
          </div>
        </div>
      </div>

      {/* Integration Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Integrations</p>
              <p className="text-2xl font-bold text-gray-900">{integrations.length}</p>
            </div>
            <Zap className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Connected</p>
              <p className="text-2xl font-bold text-green-600">{connectedCount}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Errors</p>
              <p className="text-2xl font-bold text-red-600">{errorCount}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Odoo Integration Spotlight */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              O
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Odoo ERP Integration</h3>
              <p className="text-gray-600">Comprehensive business management solution with full data synchronization</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Active
            </span>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Configure
            </button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900">Sales & CRM</h4>
            <p className="text-sm text-gray-600 mt-1">Customer data, leads, and sales pipeline</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900">Inventory & Manufacturing</h4>
            <p className="text-sm text-gray-600 mt-1">Stock levels, BOM, and production orders</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900">Accounting & Finance</h4>
            <p className="text-sm text-gray-600 mt-1">Financial reports and transactions</p>
          </div>
        </div>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-medium text-gray-600">
                  {integration.logo}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{integration.name}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(integration.type)}`}>
                    {integration.type}
                  </span>
                </div>
              </div>
              {getStatusIcon(integration.status)}
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{integration.description}</p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(integration.status)}`}>
                  {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                </span>
              </div>
              {integration.lastSync && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Last Sync:</span>
                  <span className="text-sm text-gray-900">{integration.lastSync}</span>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex space-x-2">
              <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1">
                <Settings className="w-4 h-4" />
                <span>Configure</span>
              </button>
              <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* API Documentation */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">API Documentation & SDK</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">REST API Endpoints</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-mono">GET</span>
                <code className="text-gray-600">/api/v1/inventory</code>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">POST</span>
                <code className="text-gray-600">/api/v1/production-orders</code>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-mono">PUT</span>
                <code className="text-gray-600">/api/v1/demand-forecast</code>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">SDK Libraries</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Python SDK</span>
                <button className="text-blue-600 hover:text-blue-800">Download</button>
              </div>
              <div className="flex items-center justify-between">
                <span>Node.js SDK</span>
                <button className="text-blue-600 hover:text-blue-800">Download</button>
              </div>
              <div className="flex items-center justify-between">
                <span>PHP SDK</span>
                <button className="text-blue-600 hover:text-blue-800">Download</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integration;