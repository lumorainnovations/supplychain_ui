import React from 'react';
import { Edit, Trash2, MapPin, Truck, Clock, DollarSign, Package, Route } from 'lucide-react';
import { DistributionRoute } from '../../types';

interface DistributionTableProps {
  routes: DistributionRoute[];
  onEdit: (route: DistributionRoute) => void;
  onDelete: (id: string) => void;
}

const DistributionTable: React.FC<DistributionTableProps> = ({ routes, onEdit, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'in-transit':
        return 'bg-blue-100 text-blue-800';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeliveryTypeColor = (type: string) => {
    switch (type) {
      case 'same-day':
        return 'bg-red-100 text-red-800';
      case 'overnight':
        return 'bg-orange-100 text-orange-800';
      case 'express':
        return 'bg-blue-100 text-blue-800';
      case 'standard':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Distribution Routes</h3>
        <p className="text-sm text-gray-600 mt-1">
          Showing {routes.length} routes
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Route Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Origin & Destinations
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Distance & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cost & Capacity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status & Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle & Driver
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Schedule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {routes.map((route) => (
              <tr key={route.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Route className="w-5 h-5 text-blue-500 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{route.name}</div>
                      <div className="text-sm text-gray-500">ID: {route.id}</div>
                      <div className="flex items-center mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDeliveryTypeColor(route.deliveryType)}`}>
                          {route.deliveryType.charAt(0).toUpperCase() + route.deliveryType.slice(1).replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="w-4 h-4 text-green-500 mr-1" />
                      <span className="font-medium">From:</span>
                      <span className="ml-1 truncate max-w-xs">{route.origin}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">To:</span>
                      <div className="ml-5 space-y-1">
                        {route.destinations.slice(0, 2).map((dest, index) => (
                          <div key={index} className="flex items-center">
                            <MapPin className="w-3 h-3 text-red-500 mr-1" />
                            <span className="truncate max-w-xs">{dest}</span>
                          </div>
                        ))}
                        {route.destinations.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{route.destinations.length - 2} more destinations
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-900">
                      <Route className="w-4 h-4 text-blue-500 mr-1" />
                      <span>{route.distance.toLocaleString()} mi</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-orange-500 mr-1" />
                      <span>{route.estimatedTime}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-900">
                      <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                      <span>${route.cost.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Package className="w-4 h-4 text-purple-500 mr-1" />
                      <span>{route.capacity.toLocaleString()}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(route.status)}`}>
                      {route.status.charAt(0).toUpperCase() + route.status.slice(1).replace('-', ' ')}
                    </span>
                    <div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(route.priority)}`}>
                        {route.priority.charAt(0).toUpperCase() + route.priority.slice(1)}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    {route.vehicle && (
                      <div className="flex items-center text-sm text-gray-900">
                        <Truck className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="truncate max-w-xs">{route.vehicle}</span>
                      </div>
                    )}
                    {route.driver && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Driver:</span> {route.driver}
                      </div>
                    )}
                    {!route.vehicle && !route.driver && (
                      <span className="text-sm text-gray-400">Not assigned</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-900">
                      <span className="font-medium">Scheduled:</span>
                      <div>{formatDate(route.scheduledDate || '')}</div>
                    </div>
                    {route.actualDate && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Actual:</span>
                        <div>{formatDate(route.actualDate)}</div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(route)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="Edit route"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(route.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      title="Delete route"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {routes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No distribution routes found</p>
              <p className="text-sm">Create your first distribution route to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DistributionTable;