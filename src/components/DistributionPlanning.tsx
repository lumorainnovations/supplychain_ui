import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, Filter, MapPin, DollarSign, Package, Route, AlertTriangle, AlertCircle } from 'lucide-react';
import { DistributionRoute } from '../types';
import { apiService } from '../services/api';
import { useApiMutation } from '../hooks/useApi';
import DistributionForm from './forms/DistributionForm';
import DistributionTable from './tables/DistributionTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { saveAs } from 'file-saver';

const DistributionPlanning: React.FC = () => {
  const [routes, setRoutes] = useState<DistributionRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<DistributionRoute | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterDeliveryType, setFilterDeliveryType] = useState('all');

  // API mutation hooks
  const { mutate: createRouteMutation, loading: createLoading } = useApiMutation();
  const { mutate: updateRouteMutation, loading: updateLoading } = useApiMutation();
  const { mutate: deleteRouteMutation, loading: deleteLoading } = useApiMutation();

  const statusOptions = ['all', 'active', 'inactive', 'planned', 'in-transit', 'completed'];
  const priorityOptions = ['all', 'low', 'medium', 'high', 'urgent'];
  const deliveryTypeOptions = ['all', 'standard', 'express', 'overnight', 'same-day'];

  // Load routes from API
  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getDistributionRoutes();
      // Map snake_case fields to camelCase
      const mappedRoutes = (response.routes || []).map((route: Record<string, unknown>) => ({
        id: route.id,
        name: route.name,
        origin: route.origin,
        destinations: Array.isArray(route.destinations)
          ? route.destinations
          : typeof route.destinations === 'string' && route.destinations
            ? JSON.parse(route.destinations)
            : [],
        distance: Number(route.distance),
        estimatedTime: route.estimated_time,
        cost: Number(route.cost),
        capacity: Number(route.capacity),
        status: route.status,
        vehicle: route.vehicle,
        driver: route.driver,
        priority: route.priority,
        scheduledDate: route.scheduled_date,
        actualDate: route.actual_date,
        notes: route.notes,
        deliveryType: route.delivery_type,
        customerType: route.customer_type,
      }));
      setRoutes(mappedRoutes);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load distribution routes');
      console.error('Load routes error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.destinations.some(dest => dest.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || route.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || route.priority === filterPriority;
    const matchesDeliveryType = filterDeliveryType === 'all' || route.deliveryType === filterDeliveryType;
    return matchesSearch && matchesStatus && matchesPriority && matchesDeliveryType;
  });

  const handleAddRoute = async (newRoute: Omit<DistributionRoute, 'id'>) => {
    try {
      await createRouteMutation(async () => {
        const response = await apiService.createDistributionRoute({
          name: newRoute.name,
          origin: newRoute.origin,
          destinations: newRoute.destinations,
          distance: newRoute.distance,
          estimatedTime: newRoute.estimatedTime,
          cost: newRoute.cost,
          capacity: newRoute.capacity,
          status: newRoute.status,
          vehicle: newRoute.vehicle,
          driver: newRoute.driver,
          priority: newRoute.priority,
          scheduledDate: newRoute.scheduledDate,
          actualDate: newRoute.actualDate,
          notes: newRoute.notes,
          deliveryType: newRoute.deliveryType,
          customerType: newRoute.customerType,
        });
        
        // Reload routes to get the updated list
        await loadRoutes();
        return response;
      });
      
      setShowForm(false);
    } catch (error: any) {
      console.error('Add route error:', error);
      // Error is handled by the mutation hook
    }
  };

  const handleEditRoute = async (updatedRoute: DistributionRoute) => {
    try {
      await updateRouteMutation(async () => {
        const response = await apiService.updateDistributionRoute(updatedRoute.id, {
          name: updatedRoute.name,
          origin: updatedRoute.origin,
          destinations: updatedRoute.destinations,
          distance: updatedRoute.distance,
          estimatedTime: updatedRoute.estimatedTime,
          cost: updatedRoute.cost,
          capacity: updatedRoute.capacity,
          status: updatedRoute.status,
          vehicle: updatedRoute.vehicle,
          driver: updatedRoute.driver,
          priority: updatedRoute.priority,
          scheduledDate: updatedRoute.scheduledDate,
          actualDate: updatedRoute.actualDate,
          notes: updatedRoute.notes,
          deliveryType: updatedRoute.deliveryType,
          customerType: updatedRoute.customerType,
        });
        
        // Reload routes to get the updated list
        await loadRoutes();
        return response;
      });
      
      setEditingRoute(null);
      setShowForm(false);
    } catch (error: any) {
      console.error('Update route error:', error);
      // Error is handled by the mutation hook
    }
  };

  const handleDeleteRoute = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await deleteRouteMutation(async () => {
          const response = await apiService.deleteDistributionRoute(id);
          
          // Reload routes to get the updated list
          await loadRoutes();
          return response;
        });
      } catch (error: any) {
        console.error('Delete route error:', error);
        // Error is handled by the mutation hook
      }
    }
  };

  const openEditForm = (route: DistributionRoute) => {
    setEditingRoute(route);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingRoute(null);
  };

  // Calculate metrics
  const totalRoutes = routes.length;
  const activeRoutes = routes.filter(r => r.status === 'active' || r.status === 'in-transit').length;
  const totalDistance = routes.reduce((sum, r) => sum + r.distance, 0);
  const totalCost = routes.reduce((sum, r) => sum + r.cost, 0);
  const totalCapacity = routes.reduce((sum, r) => sum + r.capacity, 0);
  const avgEfficiency = routes.length > 0 ? routes.reduce((sum, r) => {
    const efficiency = (r.capacity > 0) ? ((r.capacity - (r.capacity * 0.2)) / r.capacity) * 100 : 0;
    return sum + efficiency;
  }, 0) / routes.length : 0;

  // Chart data
  const statusDistribution = [
    { name: 'Active', value: routes.filter(r => r.status === 'active').length, color: '#10B981' },
    { name: 'In Transit', value: routes.filter(r => r.status === 'in-transit').length, color: '#3B82F6' },
    { name: 'Planned', value: routes.filter(r => r.status === 'planned').length, color: '#F59E0B' },
    { name: 'Completed', value: routes.filter(r => r.status === 'completed').length, color: '#8B5CF6' },
    { name: 'Inactive', value: routes.filter(r => r.status === 'inactive').length, color: '#EF4444' }
  ];

  const deliveryTypeData = routes.map(route => ({
    name: route.name.substring(0, 15) + '...',
    cost: route.cost,
    distance: route.distance,
    capacity: route.capacity,
    type: route.deliveryType
  }));

  const costTrendData = [
    { month: 'Jan', cost: 12500, routes: 8 },
    { month: 'Feb', cost: 13200, routes: 9 },
    { month: 'Mar', cost: 11800, routes: 7 },
    { month: 'Apr', cost: 14500, routes: 10 },
    { month: 'May', cost: 13900, routes: 9 },
    { month: 'Jun', cost: 15200, routes: 11 }
  ];

  const getStatusCounts = () => {
    return {
      active: routes.filter(r => r.status === 'active').length,
      inTransit: routes.filter(r => r.status === 'in-transit').length,
      planned: routes.filter(r => r.status === 'planned').length,
      completed: routes.filter(r => r.status === 'completed').length,
      inactive: routes.filter(r => r.status === 'inactive').length,
      urgent: routes.filter(r => r.priority === 'urgent').length
    };
  };

  const statusCounts = getStatusCounts();

  // Helper to convert routes to CSV
  function routesToCSV(routes: DistributionRoute[]) {
    const header = [
      'ID', 'Name', 'Origin', 'Destinations', 'Distance', 'Estimated Time', 'Cost', 'Capacity', 'Status', 'Vehicle', 'Driver', 'Priority', 'Scheduled Date', 'Actual Date', 'Delivery Type', 'Customer Type', 'Notes'
    ];
    const rows = routes.map(r => [
      r.id,
      r.name,
      r.origin,
      r.destinations.join('; '),
      r.distance,
      r.estimatedTime,
      r.cost,
      r.capacity,
      r.status,
      r.vehicle || '',
      r.driver || '',
      r.priority,
      r.scheduledDate || '',
      r.actualDate || '',
      r.deliveryType,
      r.customerType,
      r.notes || ''
    ]);
    return [header, ...rows].map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  }

  // --- Optimization Handler ---
  const handleOptimizeRoutes = () => {
    // Example: sort routes by distance ascending (replace with real optimization later)
    const optimized = [...routes].sort((a, b) => a.distance - b.distance);
    setRoutes(optimized);
    alert('Routes optimized by distance (demo). Replace with real optimization logic as needed.');
  };

  // --- Export Handler ---
  const handleExportReport = () => {
    const csv = routesToCSV(filteredRoutes);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'distribution_routes_report.csv');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading distribution routes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Routes</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadRoutes}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
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
            <h2 className="text-2xl font-bold text-gray-900">Distribution Planning & Route Optimization</h2>
            <p className="text-gray-600 mt-1">Manage delivery routes, optimize logistics, and track distribution performance</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowForm(true)}
              disabled={createLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>{createLoading ? 'Adding...' : 'New Route'}</span>
            </button>
            <button
              onClick={handleOptimizeRoutes}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Optimize Routes
            </button>
            <button
              onClick={handleExportReport}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Routes</p>
              <p className="text-2xl font-bold text-gray-900">{totalRoutes}</p>
            </div>
            <Truck className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Routes</p>
              <p className="text-2xl font-bold text-green-600">{activeRoutes}</p>
            </div>
            <Route className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Distance</p>
              <p className="text-2xl font-bold text-purple-600">{totalDistance.toLocaleString()} km</p>
            </div>
            <MapPin className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-orange-600">${totalCost.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Capacity</p>
              <p className="text-2xl font-bold text-indigo-600">{totalCapacity.toLocaleString()}</p>
            </div>
            <Package className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Efficiency</p>
              <p className="text-2xl font-bold text-teal-600">{avgEfficiency.toFixed(1)}%</p>
            </div>
            <Truck className="w-8 h-8 text-teal-600" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by route name, origin, or destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter by status"
              title="Filter by status"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              aria-label="Filter by priority"
              title="Filter by priority"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {priorityOptions.map(priority => (
                <option key={priority} value={priority}>
                  {priority === 'all' ? 'All Priority' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={filterDeliveryType}
              onChange={(e) => setFilterDeliveryType(e.target.value)}
              aria-label="Filter by delivery type"
              title="Filter by delivery type"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {deliveryTypeOptions.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={costTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="cost" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Routes Table */}
      <DistributionTable
        routes={filteredRoutes}
        onEdit={openEditForm}
        onDelete={handleDeleteRoute}
      />

      {/* Route Form Modal */}
      {showForm && (
        <DistributionForm
          route={editingRoute}
          onSave={editingRoute ? handleEditRoute : handleAddRoute}
          onCancel={closeForm}
        />
      )}
    </div>
  );
};

export default DistributionPlanning;