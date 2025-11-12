import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search, Filter, Star, Download, Upload, FileText, AlertCircle } from 'lucide-react';
import { Supplier } from '../types';
import { apiService } from '../services/api';
import { useApiMutation } from '../hooks/useApi';
import SupplierForm from './forms/SupplierForm';
import SupplierTable from './tables/SupplierTable';

const SupplierManagement: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // API mutation hooks
  const { mutate: createSupplierMutation, loading: createLoading } = useApiMutation();
  const { mutate: updateSupplierMutation, loading: updateLoading } = useApiMutation();
  const { mutate: deleteSupplierMutation, loading: deleteLoading } = useApiMutation();

  const statusOptions = ['all', 'active', 'inactive'];

  // Load suppliers from API
  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getSuppliers();
      // Map snake_case fields to camelCase
      const mappedSuppliers = (response.suppliers || []).map((supplier: any) => ({
        id: supplier.id,
        name: supplier.name,
        contact: supplier.contact,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        rating: Number(supplier.rating),
        status: supplier.status,
        paymentTerms: supplier.payment_terms,
      }));
      setSuppliers(mappedSuppliers);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load suppliers');
      console.error('Load suppliers error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || supplier.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddSupplier = async (newSupplier: Omit<Supplier, 'id'>) => {
    try {
      await createSupplierMutation(async () => {
        const response = await apiService.createSupplier({
          name: newSupplier.name,
          contact: newSupplier.contact,
          email: newSupplier.email,
          phone: newSupplier.phone,
          address: newSupplier.address,
          rating: newSupplier.rating,
          status: newSupplier.status,
          payment_terms: newSupplier.paymentTerms,
        });
        
        // Reload suppliers to get the updated list
        await loadSuppliers();
        return response;
      });
      
      setShowForm(false);
    } catch (error: any) {
      console.error('Add supplier error:', error);
      // Error is handled by the mutation hook
    }
  };

  const handleEditSupplier = async (updatedSupplier: Supplier) => {
    try {
      await updateSupplierMutation(async () => {
        const response = await apiService.updateSupplier(updatedSupplier.id, {
          name: updatedSupplier.name,
          contact: updatedSupplier.contact,
          email: updatedSupplier.email,
          phone: updatedSupplier.phone,
          address: updatedSupplier.address,
          rating: updatedSupplier.rating,
          status: updatedSupplier.status,
          payment_terms: updatedSupplier.paymentTerms,
        });
        
        // Reload suppliers to get the updated list
        await loadSuppliers();
        return response;
      });
      
      setEditingSupplier(null);
      setShowForm(false);
    } catch (error: any) {
      console.error('Update supplier error:', error);
      // Error is handled by the mutation hook
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await deleteSupplierMutation(async () => {
          const response = await apiService.deleteSupplier(id);
          
          // Reload suppliers to get the updated list
          await loadSuppliers();
          return response;
        });
      } catch (error: any) {
        console.error('Delete supplier error:', error);
        // Error is handled by the mutation hook
      }
    }
  };

  const openEditForm = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSupplier(null);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Contact', 'Email', 'Phone', 'Address', 'Rating', 'Status', 'Payment Terms'];
    const csvContent = [
      headers.join(','),
      ...suppliers.map(supplier => [
        supplier.id,
        `"${supplier.name}"`,
        `"${supplier.contact}"`,
        supplier.email,
        supplier.phone,
        `"${supplier.address}"`,
        supplier.rating,
        supplier.status,
        `"${supplier.paymentTerms}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `suppliers_${new Date().toISOString().split('T')[0]}.csv`);
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
      
      const importedSuppliers = lines.slice(1)
        .filter(line => line.trim())
        .map((line, index) => {
          const values = line.split(',').map(val => val.replace(/"/g, ''));
          return {
            name: values[1] || '',
            contact: values[2] || '',
            email: values[3] || '',
            phone: values[4] || '',
            address: values[5] || '',
            rating: parseFloat(values[6]) || 0,
            status: (values[7] as 'active' | 'inactive') || 'active',
            payment_terms: values[8] || ''
          };
        });

      // Import suppliers one by one
      for (const supplier of importedSuppliers) {
        try {
          await apiService.createSupplier(supplier);
        } catch (error) {
          console.error('Import supplier error:', error);
        }
      }

      // Reload suppliers
      await loadSuppliers();
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ['ID', 'Name', 'Contact', 'Email', 'Phone', 'Address', 'Rating', 'Status', 'Payment Terms'],
      ['SUP-001', 'Sample Supplier Inc.', 'John Doe', 'john@sample.com', '+1-555-0101', '123 Business St, City, State', '4.5', 'active', 'Net 30'],
      ['SUP-002', 'Another Supplier Ltd.', 'Jane Smith', 'jane@another.com', '+1-555-0102', '456 Commerce Ave, City, State', '4.2', 'active', 'Net 45']
    ];

    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'suppliers_sample.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
  const avgRating = suppliers.length > 0 ? suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Suppliers</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadSuppliers}
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
            <h2 className="text-2xl font-bold text-gray-900">Supplier Management</h2>
            <p className="text-gray-600 mt-1">Manage your supplier relationships and vendor information</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowForm(true)}
              disabled={createLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>{createLoading ? 'Adding...' : 'Add Supplier'}</span>
            </button>
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="csv-import-suppliers"
              />
              <label
                htmlFor="csv-import-suppliers"
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
              <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
              <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Suppliers</p>
              <p className="text-2xl font-bold text-green-600">{activeSuppliers}</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-yellow-600">{avgRating.toFixed(1)}</p>
            </div>
            <Star className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-red-600">{suppliers.length - activeSuppliers}</p>
            </div>
            <Users className="w-8 h-8 text-red-600" />
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
              placeholder="Search by name or contact..."
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

      {/* Import Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">CSV Import Instructions</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Download the sample CSV file to see the required format</p>
          <p>• Ensure all required fields are filled: Name, Contact, Email, Phone, Address, Rating, Status, Payment Terms</p>
          <p>• Use quotes around text fields that contain commas</p>
          <p>• Rating should be a number between 0 and 5</p>
        </div>
      </div>

      {/* Suppliers Table */}
      <SupplierTable
        suppliers={filteredSuppliers}
        onEdit={openEditForm}
        onDelete={handleDeleteSupplier}
        loading={updateLoading || deleteLoading}
      />

      {/* Supplier Form Modal */}
      {showForm && (
        <SupplierForm
          supplier={editingSupplier}
          onSave={editingSupplier ? handleEditSupplier : handleAddSupplier}
          onCancel={closeForm}
          loading={createLoading || updateLoading}
        />
      )}
    </div>
  );
};

export default SupplierManagement;