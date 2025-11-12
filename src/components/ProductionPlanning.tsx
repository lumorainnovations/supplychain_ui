import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle, PlayCircle, PauseCircle, Plus, Download, Upload, FileText, RefreshCw } from 'lucide-react';
import { ProductionOrder } from '../types';
import { apiService } from '../services/api';
import { useApiMutation } from '../hooks/useApi';
import OrderForm from './forms/OrderForm';
import OrderTable from './tables/OrderTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const ProductionPlanning: React.FC = () => {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ProductionOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { mutate: createOrderMutation, loading: createLoading } = useApiMutation();
  const { mutate: updateOrderMutation, loading: updateLoading } = useApiMutation();
  const { mutate: deleteOrderMutation, loading: deleteLoading } = useApiMutation();

  const statusOptions = ['all', 'planned', 'in-progress', 'completed', 'delayed', 'cancelled'];

  // Load production orders from API
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getProductionOrders();
      setOrders(response.orders || []);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load production orders');
      console.error('Load orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddOrder = async (newOrder: Omit<ProductionOrder, 'id'>) => {
    try {
      await createOrderMutation(() => apiService.createProductionOrder(newOrder));
      await loadOrders(); // Reload orders after creation
      setShowForm(false);
    } catch (error: any) {
      console.error('Create order error:', error);
    }
  };

  const handleEditOrder = async (updatedOrder: ProductionOrder) => {
    try {
      await updateOrderMutation(() => apiService.updateProductionOrder(updatedOrder.id, updatedOrder));
      await loadOrders(); // Reload orders after update
      setEditingOrder(null);
      setShowForm(false);
    } catch (error: any) {
      console.error('Update order error:', error);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this production order?')) {
      try {
        await deleteOrderMutation(() => apiService.deleteProductionOrder(id));
        await loadOrders(); // Reload orders after deletion
      } catch (error: any) {
        console.error('Delete order error:', error);
      }
    }
  };

  const openEditForm = (order: ProductionOrder) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingOrder(null);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Product', 'Quantity', 'Start Date', 'End Date', 'Status', 'Priority', 'Assigned To', 'Progress', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...orders.map(order => [
        order.id,
        `"${order.product}"`,
        order.quantity,
        order.startDate,
        order.endDate,
        order.status,
        order.priority,
        `"${order.assignedTo}"`,
        order.progress || 0,
        `"${order.notes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `production_orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      
      const importedOrders = lines.slice(1)
        .filter(line => line.trim())
        .map((line) => {
          const values = line.split(',').map(val => val.replace(/"/g, ''));
          return {
            product: values[1] || '',
            quantity: parseInt(values[2]) || 0,
            startDate: values[3] || '',
            endDate: values[4] || '',
            status: (values[5] as ProductionOrder['status']) || 'planned',
            priority: (values[6] as ProductionOrder['priority']) || 'medium',
            assignedTo: values[7] || '',
            progress: parseInt(values[8]) || 0,
            notes: values[9] || ''
          };
        });

      // Import orders one by one
      for (const orderData of importedOrders) {
        try {
          await createOrderMutation(() => apiService.createProductionOrder(orderData));
        } catch (error) {
          console.error('Failed to import order:', orderData.product, error);
        }
      }
      
      await loadOrders(); // Reload orders after import
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ['ID', 'Product', 'Quantity', 'Start Date', 'End Date', 'Status', 'Priority', 'Assigned To', 'Progress', 'Notes'],
      ['PO-001', 'Industrial Pump', '50', '2024-01-20', '2024-01-25', 'in-progress', 'high', 'Production Team A', '65', 'On schedule, quality checks passed'],
      ['PO-002', 'Control Panel', '25', '2024-01-22', '2024-01-28', 'planned', 'medium', 'Production Team B', '0', 'Waiting for materials']
    ];

    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'production_orders_sample.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <PlayCircle className="w-5 h-5 text-blue-500" />;
      case 'delayed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <PauseCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'delayed':
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusCounts = () => {
    return {
      total: orders.length,
      planned: orders.filter(o => o.status === 'planned').length,
      inProgress: orders.filter(o => o.status === 'in-progress').length,
      completed: orders.filter(o => o.status === 'completed').length,
      delayed: orders.filter(o => o.status === 'delayed').length
    };
  };

  const statusCounts = getStatusCounts();

  // Chart data for production metrics
  const productionTrendData = [
    { month: 'Jan', planned: 15, completed: 12, delayed: 2 },
    { month: 'Feb', planned: 18, completed: 16, delayed: 1 },
    { month: 'Mar', planned: 20, completed: 18, delayed: 3 },
    { month: 'Apr', planned: 22, completed: 20, delayed: 2 },
    { month: 'May', planned: 25, completed: 23, delayed: 1 },
    { month: 'Jun', planned: 28, completed: 26, delayed: 2 }
  ];

  const efficiencyData = [
    { team: 'Team A', efficiency: 92, utilization: 85 },
    { team: 'Team B', efficiency: 88, utilization: 78 },
    { team: 'Team C', efficiency: 95, utilization: 92 },
    { team: 'Team D', efficiency: 87, utilization: 80 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading production orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading production orders</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={loadOrders}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try again</span>
              </button>
            </div>
          </div>
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
            <h2 className="text-2xl font-bold text-gray-900">Production Planning & Scheduling</h2>
            <p className="text-gray-600 mt-1">Manage production orders and optimize scheduling</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowForm(true)}
              disabled={createLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{createLoading ? 'Creating...' : 'New Production Order'}</span>
            </button>
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="csv-import-production"
              />
              <label
                htmlFor="csv-import-production"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Import CSV</span>
              </label>
            </div>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={downloadSampleCSV}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Sample CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Production Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.total}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Planned</p>
              <p className="text-2xl font-bold text-yellow-600">{statusCounts.planned}</p>
            </div>
            <PauseCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{statusCounts.inProgress}</p>
            </div>
            <PlayCircle className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{statusCounts.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delayed</p>
              <p className="text-2xl font-bold text-red-600">{statusCounts.delayed}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Trend Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Production Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={productionTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="planned" stroke="#F59E0B" strokeWidth={2} name="Planned" />
              <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} name="Completed" />
              <Line type="monotone" dataKey="delayed" stroke="#EF4444" strokeWidth={2} name="Delayed" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Team Efficiency Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={efficiencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="team" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="efficiency" fill="#3B82F6" name="Efficiency %" />
              <Bar dataKey="utilization" fill="#10B981" name="Utilization %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Import Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">CSV Import Instructions</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Download the sample CSV file to see the required format</p>
          <p>• Required fields: Product, Quantity, Start Date, End Date, Status, Priority, Assigned To</p>
          <p>• Date format should be YYYY-MM-DD</p>
          <p>• Valid status: planned, in-progress, completed, delayed, cancelled</p>
          <p>• Valid priority: low, medium, high, urgent</p>
          <p>• Progress should be a number between 0 and 100</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by product, order ID, or team..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Production Schedule Timeline */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Production Schedule Timeline</h3>
        <div className="space-y-4">
          {filteredOrders.slice(0, 10).map((order) => (
            <div key={order.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              {getStatusIcon(order.status)}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{order.product}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(order.priority)}`}>
                    {order.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Order ID: {order.id} • Quantity: {order.quantity} units</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{order.startDate} - {order.endDate}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{order.assignedTo}</span>
                  </div>
                  {order.progress !== undefined && (
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${order.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{order.progress}%</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('-', ' ')}
                </span>
              </div>
            </div>
          ))}
          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No production orders found</p>
            </div>
          )}
        </div>
      </div>

      {/* Resource Allocation and Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Allocation</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Production Team A</span>
                <span>85% Utilized</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Production Team B</span>
                <span>70% Utilized</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Production Team C</span>
                <span>95% Utilized</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Production Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Overall Equipment Effectiveness (OEE):</span>
              <span className="font-semibold text-green-600">78%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Lead Time:</span>
              <span className="font-semibold">5.2 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">First Pass Yield:</span>
              <span className="font-semibold text-green-600">94%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Schedule Adherence:</span>
              <span className="font-semibold text-yellow-600">87%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">On-Time Delivery:</span>
              <span className="font-semibold text-green-600">
                {statusCounts.total > 0 ? Math.round((statusCounts.completed / statusCounts.total) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Production Orders Table */}
      <OrderTable
        orders={filteredOrders}
        onEdit={openEditForm}
        onDelete={handleDeleteOrder}
      />

      {/* Order Form Modal */}
      {showForm && (
        <OrderForm
          order={editingOrder}
          onSave={editingOrder ? handleEditOrder : handleAddOrder}
          onCancel={closeForm}
        />
      )}

      {/* Loading overlay for operations */}
      {(updateLoading || deleteLoading) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-900">
              {updateLoading && 'Updating order...'}
              {deleteLoading && 'Deleting order...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionPlanning;