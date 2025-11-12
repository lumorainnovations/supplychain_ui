import React, { useState, useEffect } from 'react';
import { BarChart3, Plus, Search, Filter, TrendingUp, AlertTriangle, Settings, Activity, AlertCircle } from 'lucide-react';
import { CapacityResource } from '../types';
import { apiService } from '../services/api';
import { useApiMutation } from '../hooks/useApi';
import CapacityForm from './forms/CapacityForm';
import CapacityTable from './tables/CapacityTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { saveAs } from 'file-saver';

const CapacityModeling: React.FC = () => {
  const [resources, setResources] = useState<CapacityResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<CapacityResource | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // API mutation hooks
  const { mutate: createResourceMutation, loading: createLoading } = useApiMutation();
  const { mutate: updateResourceMutation, loading: updateLoading } = useApiMutation();
  const { mutate: deleteResourceMutation, loading: deleteLoading } = useApiMutation();

  const typeOptions = ['all', 'machine', 'labor', 'facility'];
  const statusOptions = ['all', 'operational', 'maintenance', 'offline'];

  // Load resources from API
  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getCapacityResources();
      // Map snake_case fields to camelCase
      const mappedResources = (response.resources || []).map((resource: Record<string, unknown>) => ({
        id: resource.id,
        name: resource.name,
        type: resource.type,
        capacity: Number(resource.capacity),
        utilized: Number(resource.utilized),
        efficiency: Number(resource.efficiency),
        department: resource.department,
        status: resource.status,
        location: resource.location,
        cost: resource.cost ? Number(resource.cost) : undefined,
      }));
      setResources(mappedResources);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load capacity resources');
      console.error('Load resources error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || resource.type === filterType;
    const matchesStatus = filterStatus === 'all' || resource.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAddResource = async (newResource: Omit<CapacityResource, 'id'>) => {
    try {
      await createResourceMutation(async () => {
        const response = await apiService.createCapacityResource({
          name: newResource.name,
          type: newResource.type,
          capacity: newResource.capacity,
          utilized: newResource.utilized,
          efficiency: newResource.efficiency,
          department: newResource.department,
          status: newResource.status,
          location: newResource.location,
          cost: newResource.cost,
        });
        
        // Reload resources to get the updated list
        await loadResources();
        return response;
      });
      
      setShowForm(false);
    } catch (error: any) {
      console.error('Add resource error:', error);
      // Error is handled by the mutation hook
    }
  };

  const handleEditResource = async (updatedResource: CapacityResource) => {
    try {
      await updateResourceMutation(async () => {
        const response = await apiService.updateCapacityResource(updatedResource.id, {
          name: updatedResource.name,
          type: updatedResource.type,
          capacity: updatedResource.capacity,
          utilized: updatedResource.utilized,
          efficiency: updatedResource.efficiency,
          department: updatedResource.department,
          status: updatedResource.status,
          location: updatedResource.location,
          cost: updatedResource.cost,
        });
        
        // Reload resources to get the updated list
        await loadResources();
        return response;
      });
      
      setEditingResource(null);
      setShowForm(false);
    } catch (error: any) {
      console.error('Update resource error:', error);
      // Error is handled by the mutation hook
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await deleteResourceMutation(async () => {
          const response = await apiService.deleteCapacityResource(id);
          
          // Reload resources to get the updated list
          await loadResources();
          return response;
        });
      } catch (error: any) {
        console.error('Delete resource error:', error);
        // Error is handled by the mutation hook
      }
    }
  };

  const openEditForm = (resource: CapacityResource) => {
    setEditingResource(resource);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingResource(null);
  };

  // Calculate metrics
  const totalCapacity = resources.reduce((sum, r) => sum + r.capacity, 0);
  const totalUtilized = resources.reduce((sum, r) => sum + r.utilized, 0);
  const avgEfficiency = resources.length > 0 ? resources.reduce((sum, r) => sum + r.efficiency, 0) / resources.length : 0;
  const utilizationRate = totalCapacity > 0 ? (totalUtilized / totalCapacity) * 100 : 0;
  const operationalCount = resources.filter(r => r.status === 'operational').length;
  const maintenanceCount = resources.filter(r => r.status === 'maintenance').length;

  // Chart data
  const utilizationData = resources.map(resource => ({
    name: resource.name.substring(0, 15) + '...',
    capacity: resource.capacity,
    utilized: resource.utilized,
    efficiency: resource.efficiency,
    utilizationRate: (resource.utilized / resource.capacity) * 100
  }));

  const efficiencyTrendData = [
    { month: 'Jan', efficiency: 88 },
    { month: 'Feb', efficiency: 92 },
    { month: 'Mar', efficiency: 89 },
    { month: 'Apr', efficiency: 94 },
    { month: 'May', efficiency: 91 },
    { month: 'Jun', efficiency: 96 }
  ];

  const typeDistributionData = [
    { name: 'Machine', value: resources.filter(r => r.type === 'machine').length, color: '#3B82F6' },
    { name: 'Labor', value: resources.filter(r => r.type === 'labor').length, color: '#10B981' },
    { name: 'Facility', value: resources.filter(r => r.type === 'facility').length, color: '#F59E0B' }
  ];

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600';
    if (rate >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <Activity className="w-4 h-4 text-green-500" />;
      case 'maintenance':
        return <Settings className="w-4 h-4 text-yellow-500" />;
      case 'offline':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  // --- Capacity Report Handler ---
  function resourcesToCSV(resources: CapacityResource[]) {
    const header = [
      'ID', 'Name', 'Type', 'Capacity', 'Utilized', 'Efficiency', 'Department', 'Status', 'Location', 'Cost'
    ];
    const rows = resources.map(r => [
      r.id,
      r.name,
      r.type,
      r.capacity,
      r.utilized,
      r.efficiency,
      r.department,
      r.status,
      r.location || '',
      r.cost || ''
    ]);
    return [header, ...rows].map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  }

  const handleExportReport = () => {
    const csv = resourcesToCSV(filteredResources);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'capacity_report.csv');
  };

  // --- Optimize Schedule Handler ---
  const handleOptimizeSchedule = () => {
    // Example: sort by utilization rate descending
    const optimized = [...resources].sort((a, b) => (b.utilized / b.capacity) - (a.utilized / a.capacity));
    setResources(optimized);
    alert('Resources optimized by utilization rate (demo). Replace with real optimization logic as needed.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading capacity resources...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Resources</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadResources}
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
            <h2 className="text-2xl font-bold text-gray-900">Capacity Modeling & Resource Management</h2>
            <p className="text-gray-600 mt-1">Monitor and optimize resource capacity, utilization, and efficiency</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowForm(true)}
              disabled={createLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>{createLoading ? 'Adding...' : 'Add Resource'}</span>
            </button>
            <button
              onClick={handleExportReport}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Capacity Report
            </button>
            <button
              onClick={handleOptimizeSchedule}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Optimize Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Resources</p>
              <p className="text-2xl font-bold text-gray-900">{resources.length}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Capacity</p>
              <p className="text-2xl font-bold text-gray-900">{totalCapacity.toLocaleString()}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilization Rate</p>
              <p className={`text-2xl font-bold ${getUtilizationColor(utilizationRate)}`}>
                {utilizationRate.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Efficiency</p>
              <p className="text-2xl font-bold text-blue-600">{avgEfficiency.toFixed(1)}%</p>
            </div>
            <Activity className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Operational</p>
              <p className="text-2xl font-bold text-green-600">{operationalCount}</p>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-yellow-600">{maintenanceCount}</p>
            </div>
            <Settings className="w-8 h-8 text-yellow-600" />
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
              placeholder="Search by name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              aria-label="Filter by resource type"
              title="Filter by resource type"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {typeOptions.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              aria-label="Filter by status"
              title="Filter by status"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilization Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Utilization</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={utilizationData.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="utilizationRate" fill="#3B82F6" name="Utilization %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Efficiency Trend */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Efficiency Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={efficiencyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="efficiency" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resource Type Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Type Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={typeDistributionData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {typeDistributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Resources Table */}
      <CapacityTable
        resources={filteredResources}
        onEdit={openEditForm}
        onDelete={handleDeleteResource}
      />

      {/* Resource Form Modal */}
      {showForm && (
        <CapacityForm
          resource={editingResource}
          onSave={editingResource ? handleEditResource : handleAddResource}
          onCancel={closeForm}
        />
      )}
    </div>
  );
};

export default CapacityModeling;