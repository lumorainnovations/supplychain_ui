import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, Search, Filter, Download, Upload, FileText, AlertCircle } from 'lucide-react';
import { InventoryItem } from '../types';
import { apiService } from '../services/api';
import { useApiMutation } from '../hooks/useApi';
import InventoryForm from './forms/InventoryForm';
import InventoryTable from './tables/InventoryTable';

const InventoryManagement: React.FC = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // API mutation hooks
  const { mutate: createItemMutation, loading: createLoading } = useApiMutation();
  const { mutate: updateItemMutation, loading: updateLoading } = useApiMutation();
  const { mutate: deleteItemMutation, loading: deleteLoading } = useApiMutation();

  // Load inventory items from API
  useEffect(() => {
    loadInventoryItems();
  }, []);

  const loadInventoryItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getInventory();
      // Map snake_case fields to camelCase
      const mappedItems = (response.items || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        currentStock: Number(item.current_stock),
        minStock: Number(item.min_stock),
        maxStock: Number(item.max_stock),
        unit: item.unit,
        lastRestocked: item.last_restocked,
        supplier: item.supplier,
        cost: Number(item.cost),
        location: item.location,
        description: item.description,
      }));
      setInventoryItems(mappedItems);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load inventory items');
      console.error('Load inventory error:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(inventoryItems.map(item => item.category)))];

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = async (newItem: Omit<InventoryItem, 'id'>) => {
    try {
      await createItemMutation(async () => {
        const response = await apiService.createInventoryItem({
          name: newItem.name,
          sku: newItem.sku,
          category: newItem.category,
          current_stock: newItem.currentStock,
          min_stock: newItem.minStock,
          max_stock: newItem.maxStock,
          unit: newItem.unit,
          last_restocked: newItem.lastRestocked,
          supplier: newItem.supplier,
          cost: newItem.cost,
          location: newItem.location,
          description: newItem.description
        });
        
        // Reload inventory items to get the updated list
        await loadInventoryItems();
        return response;
      });
      
      setShowForm(false);
    } catch (error: any) {
      console.error('Add item error:', error);
      // Error is handled by the mutation hook
    }
  };

  const handleEditItem = async (updatedItem: InventoryItem) => {
    try {
      await updateItemMutation(async () => {
        const response = await apiService.updateInventoryItem(updatedItem.id, {
          name: updatedItem.name,
          sku: updatedItem.sku,
          category: updatedItem.category,
          current_stock: updatedItem.currentStock,
          min_stock: updatedItem.minStock,
          max_stock: updatedItem.maxStock,
          unit: updatedItem.unit,
          last_restocked: updatedItem.lastRestocked,
          supplier: updatedItem.supplier,
          cost: updatedItem.cost,
          location: updatedItem.location,
          description: updatedItem.description
        });
        
        // Reload inventory items to get the updated list
        await loadInventoryItems();
        return response;
      });
      
      setEditingItem(null);
      setShowForm(false);
    } catch (error: any) {
      console.error('Update item error:', error);
      // Error is handled by the mutation hook
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItemMutation(async () => {
          const response = await apiService.deleteInventoryItem(id);
          
          // Reload inventory items to get the updated list
          await loadInventoryItems();
          return response;
        });
      } catch (error: any) {
        console.error('Delete item error:', error);
        // Error is handled by the mutation hook
      }
    }
  };

  const openEditForm = (item: InventoryItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'SKU', 'Category', 'Current Stock', 'Min Stock', 'Max Stock', 'Unit', 'Last Restocked', 'Supplier', 'Cost', 'Location', 'Description'];
    const csvContent = [
      headers.join(','),
      ...inventoryItems.map(item => [
        item.id,
        `"${item.name}"`,
        item.sku,
        `"${item.category}"`,
        item.currentStock,
        item.minStock,
        item.maxStock,
        item.unit,
        item.lastRestocked,
        `"${item.supplier}"`,
        item.cost,
        `"${item.location || ''}"`,
        `"${item.description || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      
      const importedItems = lines.slice(1)
        .filter(line => line.trim())
        .map((line, index) => {
          const values = line.split(',').map(val => val.replace(/"/g, ''));
          return {
            name: values[1] || '',
            sku: values[2] || '',
            category: values[3] || '',
            current_stock: parseInt(values[4]) || 0,
            min_stock: parseInt(values[5]) || 0,
            max_stock: parseInt(values[6]) || 0,
            unit: values[7] || '',
            last_restocked: values[8] || new Date().toISOString().split('T')[0],
            supplier: values[9] || '',
            cost: parseFloat(values[10]) || 0,
            location: values[11] || '',
            description: values[12] || ''
          };
        });

      // Import items one by one
      for (const item of importedItems) {
        try {
          await apiService.createInventoryItem(item);
        } catch (error) {
          console.error('Import item error:', error);
        }
      }

      // Reload inventory items
      await loadInventoryItems();
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ['ID', 'Name', 'SKU', 'Category', 'Current Stock', 'Min Stock', 'Max Stock', 'Unit', 'Last Restocked', 'Supplier', 'Cost', 'Location', 'Description'],
      ['1', 'Sample Product', 'SAMPLE-001', 'Raw Materials', '100', '20', '200', 'units', '2024-01-15', 'Sample Supplier', '25.50', 'Warehouse A', 'Sample description'],
      ['2', 'Another Product', 'SAMPLE-002', 'Components', '50', '10', '100', 'pieces', '2024-01-10', 'Another Supplier', '15.75', 'Warehouse B', 'Another description']
    ];

    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventory_sample.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock <= item.minStock) return 'low';
    if (item.currentStock >= item.maxStock * 0.8) return 'high';
    return 'normal';
  };

  const lowStockCount = inventoryItems.filter(item => getStockStatus(item) === 'low').length;
  const totalValue = inventoryItems.reduce((sum, item) => sum + (item.currentStock * item.cost), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Inventory</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadInventoryItems}
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
            <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
            <p className="text-gray-600 mt-1">Manage your inventory items, stock levels, and suppliers</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowForm(true)}
              disabled={createLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>{createLoading ? 'Adding...' : 'Add Item'}</span>
            </button>
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="csv-import-inventory"
              />
              <label
                htmlFor="csv-import-inventory"
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{inventoryItems.length}</p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-red-600">{lowStockCount}</p>
            </div>
            <Package className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
            </div>
            <Package className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length - 1}</p>
            </div>
            <Package className="w-8 h-8 text-purple-600" />
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
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Import Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">CSV Import Instructions</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Download the sample CSV file to see the required format</p>
          <p>• Ensure all required fields are filled: Name, SKU, Category, Stock levels, Unit, Supplier, Cost</p>
          <p>• Use quotes around text fields that contain commas</p>
          <p>• Date format should be YYYY-MM-DD</p>
        </div>
      </div>

      {/* Inventory Table */}
      <InventoryTable
        items={filteredItems}
        onEdit={openEditForm}
        onDelete={handleDeleteItem}
        loading={updateLoading || deleteLoading}
      />

      {/* Inventory Form Modal */}
      {showForm && (
        <InventoryForm
          item={editingItem}
          onSave={editingItem ? handleEditItem : handleAddItem}
          onCancel={closeForm}
          loading={createLoading || updateLoading}
        />
      )}
    </div>
  );
};

export default InventoryManagement;