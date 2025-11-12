import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { ProductionOrder } from '../types';
import { apiService, formatDateToYMD } from '../services/api';
import { useApiMutation } from '../hooks/useApi';
import OrderForm from './forms/OrderForm';
import OrderTable from './tables/OrderTable';

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ProductionOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // API mutation hooks
  const { mutate: createOrderMutation, loading: createLoading } = useApiMutation();
  const { mutate: updateOrderMutation, loading: updateLoading } = useApiMutation();
  const { mutate: deleteOrderMutation, loading: deleteLoading } = useApiMutation();

  const statusOptions = ['all', 'planned', 'in-progress', 'completed', 'delayed'];

  // Load orders from API
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getProductionOrders();
      // Map snake_case fields to camelCase
      const mappedOrders = (response.orders || []).map((order: Record<string, any>) => ({
        id: order.id,
        product: order.product,
        quantity: Number(order.quantity),
        startDate: order.startDate, // use camelCase from API service
        endDate: order.endDate,     // use camelCase from API service
        status: order.status,
        priority: order.priority,
        assignedTo: order.assignedTo, // use camelCase from API service
        progress: Number(order.progress || 0),
        notes: order.notes,
      }));
      setOrders(mappedOrders);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load production orders');
      console.error('Load orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => 
    filterStatus === 'all' || order.status === filterStatus
  );

  // Improved date conversion: handles both DD-MM-YYYY and YYYY-MM-DD
  const toISODate = (dateStr: string) => {
    if (!dateStr) return '';
    // Accept both DD-MM-YYYY and YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr; // already ISO
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) return dateStr; // already ISO
      // Otherwise, assume DD-MM-YYYY
      const [day, month, year] = parts;
      return `${year}-${month}-${day}`;
    }
    return '';
  };

  const handleAddOrder = async (newOrder: Omit<ProductionOrder, 'id'>) => {
    try {
      // Debug log for newOrder
      console.log('newOrder:', newOrder);
      const payload = {
        product: newOrder.product,
        quantity: newOrder.quantity,
        startDate: formatDateToYMD(newOrder.startDate),
        endDate: formatDateToYMD(newOrder.endDate),
        status: newOrder.status,
        priority: newOrder.priority,
        assignedTo: newOrder.assignedTo,
        progress: newOrder.progress || 0,
        notes: newOrder.notes,
      };
      console.log('Production order payload:', payload);
      await createOrderMutation(async () => {
        const response = await apiService.createProductionOrder(payload);
        await loadOrders();
        return response;
      });
      setShowForm(false);
    } catch (error: any) {
      console.error('Add order error:', error);
      // Error is handled by the mutation hook
    }
  };

  const handleEditOrder = async (updatedOrder: ProductionOrder) => {
    try {
      await updateOrderMutation(async () => {
        const response = await apiService.updateProductionOrder(updatedOrder.id, {
          product: updatedOrder.product,
          quantity: updatedOrder.quantity,
          startDate: formatDateToYMD(updatedOrder.startDate),
          endDate: formatDateToYMD(updatedOrder.endDate),
          status: updatedOrder.status,
          priority: updatedOrder.priority,
          assignedTo: updatedOrder.assignedTo,
          progress: updatedOrder.progress || 0,
          notes: updatedOrder.notes,
        });
        
        // Reload orders to get the updated list
        await loadOrders();
        return response;
      });
      
      setEditingOrder(null);
      setShowForm(false);
    } catch (error: any) {
      console.error('Update order error:', error);
      // Error is handled by the mutation hook
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrderMutation(async () => {
          const response = await apiService.deleteProductionOrder(id);
          
          // Reload orders to get the updated list
          await loadOrders();
          return response;
        });
      } catch (error: any) {
        console.error('Delete order error:', error);
        // Error is handled by the mutation hook
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Orders</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadOrders}
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
            <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
            <p className="text-gray-600 mt-1">Manage production orders and track their progress</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowForm(true)}
              disabled={createLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>{createLoading ? 'Adding...' : 'New Order'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.total}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Planned</p>
              <p className="text-2xl font-bold text-yellow-600">{statusCounts.planned}</p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{statusCounts.inProgress}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
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

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            aria-label="Filter orders by status"
            title="Filter orders by status"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <OrderTable
        orders={filteredOrders}
        onEdit={openEditForm}
        onDelete={handleDeleteOrder}
        loading={updateLoading || deleteLoading}
      />

      {/* Order Form Modal */}
      {showForm && (
        <OrderForm
          order={editingOrder}
          onSave={editingOrder ? handleEditOrder : handleAddOrder}
          onCancel={closeForm}
          loading={createLoading || updateLoading}
        />
      )}
    </div>
  );
};

export default OrderManagement;