import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Filter, Download, Upload, AlertCircle } from 'lucide-react';
import { BillOfMaterial } from '../types';
import { apiService } from '../services/api';
import { useApiMutation } from '../hooks/useApi';
import BOMForm from './forms/BOMForm';
import BOMTable from './tables/BOMTable';
import Papa from 'papaparse';

const BOMManagement: React.FC = () => {
  const [boms, setBOMs] = useState<BillOfMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBOM, setEditingBOM] = useState<BillOfMaterial | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // API mutation hooks
  const { mutate: createBOMMutation, loading: createLoading } = useApiMutation();
  const { mutate: updateBOMMutation } = useApiMutation();
  const { mutate: deleteBOMMutation } = useApiMutation();

  const statusOptions = ['all', 'active', 'draft', 'obsolete'];

  // Load BOMs from API
  useEffect(() => {
    loadBOMs();
  }, []);

  const loadBOMs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getBOMs();
      // Map snake_case fields to camelCase
      const mappedBOMs: BillOfMaterial[] = (response.boms || []).map((bom: any) => ({
        id: bom.id,
        product: bom.product,
        version: bom.version,
        status: bom.status,
        totalCost: Number(bom.total_cost),
        components: (bom.components || []).map((comp: any) => ({
          id: comp.id,
          name: comp.name,
          quantity: Number(comp.quantity),
          unit: comp.unit,
          cost: Number(comp.cost)
        })),
        description: bom.description,
        createdDate: bom.created_date,
        lastUpdated: bom.last_modified,
      }));
      setBOMs(mappedBOMs);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load BOMs');
      console.error('Load BOMs error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBOMs = boms.filter(bom => {
    const matchesSearch = bom.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bom.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || bom.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddBOM = async (newBOM: Omit<BillOfMaterial, 'id'>) => {
    try {
      await createBOMMutation(async () => {
        // Prepare components for backend
        const components = (newBOM.components || []).map((comp: BillOfMaterial['components'][0]) => ({
          component_id: comp.id || undefined,
          name: comp.name,
          quantity: comp.quantity,
          unit: comp.unit,
          cost: comp.cost
        }));
        const payload = {
          product: newBOM.product,
          version: newBOM.version,
          status: newBOM.status,
          components
        };
        const response = await apiService.createBOM(payload);
        // Reload BOMs to get the updated list
        await loadBOMs();
        return response;
      });
      setShowForm(false);
    } catch (error: any) {
      console.error('Add BOM error:', error);
      // Error is handled by the mutation hook
    }
  };

  const handleEditBOM = async (updatedBOM: BillOfMaterial) => {
    try {
      await updateBOMMutation(async () => {
        const response = await apiService.updateBOM(updatedBOM.id, {
          product: updatedBOM.product,
          version: updatedBOM.version,
          status: updatedBOM.status,
          total_cost: updatedBOM.totalCost,
          components: updatedBOM.components,
        });
        
        // Reload BOMs to get the updated list
        await loadBOMs();
        return response;
      });
      
      setEditingBOM(null);
      setShowForm(false);
    } catch (error: any) {
      console.error('Update BOM error:', error);
      // Error is handled by the mutation hook
    }
  };

  const handleDeleteBOM = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this BOM?')) {
      try {
        await deleteBOMMutation(async () => {
          const response = await apiService.deleteBOM(id);
          
          // Reload BOMs to get the updated list
          await loadBOMs();
          return response;
        });
      } catch (error: any) {
        console.error('Delete BOM error:', error);
        // Error is handled by the mutation hook
      }
    }
  };

  const openEditForm = (bom: BillOfMaterial) => {
    setEditingBOM(bom);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBOM(null);
  };

  const activeBOMsCount = boms.filter(bom => bom.status === 'active').length;
  const totalValue = boms.reduce((sum, bom) => sum + bom.totalCost, 0);

  // Export BOMs to CSV
  const handleExport = () => {
    if (boms.length === 0) return;
    // Flatten BOMs and components for CSV
    const rows = boms.flatMap(bom =>
      bom.components.map(component => ({
        BOM_ID: bom.id,
        Product: bom.product,
        Version: bom.version,
        Status: bom.status,
        LastUpdated: bom.lastUpdated, // Use correct field name
        TotalCost: bom.totalCost,
        ComponentID: component.id,
        ComponentName: component.name,
        Quantity: component.quantity,
        Unit: component.unit,
        Cost: component.cost
      }))
    );
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `boms_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import BOMs from CSV
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: Papa.ParseResult<Record<string, string>>) => {
        // Group rows by BOM_ID
        const bomMap: Record<string, { product: string; version: string; status: string; components: BillOfMaterial['components'] }> = {};
        for (const row of results.data) {
          if (!bomMap[row.BOM_ID]) {
            bomMap[row.BOM_ID] = {
              product: row.Product,
              version: row.Version,
              status: row.Status,
              components: []
            };
          }
          bomMap[row.BOM_ID].components.push({
            id: row.ComponentID,
            name: row.ComponentName,
            quantity: Number(row.Quantity),
            unit: row.Unit,
            cost: Number(row.Cost)
          });
        }
        // Create BOMs via API
        for (const bomId in bomMap) {
          try {
            await apiService.createBOM(bomMap[bomId]);
          } catch (error) {
            console.error('Import BOM error:', error);
          }
        }
        // Reload BOMs
        await loadBOMs();
      }
    });
    // Reset the input
    event.target.value = '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading BOMs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading BOMs</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadBOMs}
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
            <h2 className="text-2xl font-bold text-gray-900">Bill of Materials Management</h2>
            <p className="text-gray-600 mt-1">Manage product structures and component requirements</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowForm(true)}
              disabled={createLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>{createLoading ? 'Adding...' : 'New BOM'}</span>
            </button>
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="csv-import-boms"
              />
              <label
                htmlFor="csv-import-boms"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </label>
            </div>
            <button
              onClick={handleExport}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total BOMs</p>
              <p className="text-2xl font-bold text-gray-900">{boms.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active BOMs</p>
              <p className="text-2xl font-bold text-green-600">{activeBOMsCount}</p>
            </div>
            <FileText className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Components</p>
              <p className="text-2xl font-bold text-gray-900">
                {boms.length > 0 ? Math.round(boms.reduce((sum, bom) => sum + bom.components.length, 0) / boms.length) : 0}
              </p>
            </div>
            <FileText className="w-8 h-8 text-orange-600" />
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
              placeholder="Search by product or BOM ID..."
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
              aria-label="Filter BOMs by status"
              title="Filter BOMs by status"
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

      {/* BOM Table */}
      <BOMTable
        boms={filteredBOMs}
        onEdit={openEditForm}
        onDelete={handleDeleteBOM}
      />

      {/* BOM Form Modal */}
      {showForm && (
        <BOMForm
          bom={editingBOM}
          onSave={editingBOM ? handleEditBOM : handleAddBOM}
          onCancel={closeForm}
        />
      )}
    </div>
  );
};

export default BOMManagement;