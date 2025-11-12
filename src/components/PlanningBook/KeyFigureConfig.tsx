import React, { useState } from 'react';
import { Plus, Edit, Trash2, Calculator } from 'lucide-react';
import { apiService } from '../../services/api';
import type { KeyFigure } from '../../types/planningBook';

interface KeyFigureConfigProps {
  keyFigures: KeyFigure[];
  onRefresh: () => void;
}

const KeyFigureConfig: React.FC<KeyFigureConfigProps> = ({ keyFigures, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingKeyFigure, setEditingKeyFigure] = useState<KeyFigure | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'base' as 'base' | 'calculated',
    unit: '',
    formula: '',
    source_table: '',
    source_field: '',
    aggregation: 'sum' as 'sum' | 'avg' | 'min' | 'max' | 'count',
    display_format: 'number'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingKeyFigure) {
        await apiService.updateKeyFigure(editingKeyFigure.id, formData);
      } else {
        await apiService.createKeyFigure(formData);
      }
      setShowForm(false);
      setEditingKeyFigure(null);
      onRefresh();
    } catch (error: any) {
      console.error('Failed to save key figure:', error);
      alert(error.response?.data?.error || 'Failed to save key figure');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this key figure?')) return;
    try {
      await apiService.deleteKeyFigure(id);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete key figure:', error);
      alert('Failed to delete key figure');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Key Figures</h3>
        <button
          onClick={() => {
            setEditingKeyFigure(null);
            setFormData({
              code: '',
              name: '',
              description: '',
              type: 'base',
              unit: '',
              formula: '',
              source_table: '',
              source_field: '',
              aggregation: 'sum',
              display_format: 'number'
            });
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Key Figure
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {keyFigures.map((kf) => (
          <div key={kf.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{kf.name}</h4>
                    <p className="text-xs text-gray-500">{kf.code}</p>
                  </div>
                </div>
                {kf.description && (
                  <p className="text-sm text-gray-600 mt-2">{kf.description}</p>
                )}
                <div className="mt-2 flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    kf.type === 'calculated' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {kf.type}
                  </span>
                  {kf.unit && (
                    <span className="text-xs text-gray-500">Unit: {kf.unit}</span>
                  )}
                </div>
                {kf.type === 'calculated' && kf.formula && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono text-gray-700">
                    {kf.formula}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-1 ml-2">
                <button
                  onClick={() => {
                    setEditingKeyFigure(kf);
                    setFormData({
                      code: kf.code,
                      name: kf.name,
                      description: kf.description || '',
                      type: kf.type,
                      unit: kf.unit || '',
                      formula: kf.formula || '',
                      source_table: kf.sourceTable || '',
                      source_field: kf.sourceField || '',
                      aggregation: kf.aggregation || 'sum',
                      display_format: kf.displayFormat || 'number'
                    });
                    setShowForm(true);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(kf.id)}
                  className="p-2 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white rounded-lg p-6 w-[600px] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingKeyFigure ? 'Edit Key Figure' : 'New Key Figure'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                    disabled={!!editingKeyFigure}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'base' | 'calculated' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="base">Base</option>
                  <option value="calculated">Calculated</option>
                </select>
              </div>
              {formData.type === 'base' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Source Table</label>
                      <input
                        type="text"
                        value={formData.source_table}
                        onChange={(e) => setFormData({ ...formData, source_table: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="e.g., inventory"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Source Field</label>
                      <input
                        type="text"
                        value={formData.source_field}
                        onChange={(e) => setFormData({ ...formData, source_field: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="e.g., current_stock"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aggregation</label>
                    <select
                      value={formData.aggregation}
                      onChange={(e) => setFormData({ ...formData, aggregation: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="sum">Sum</option>
                      <option value="avg">Average</option>
                      <option value="min">Minimum</option>
                      <option value="max">Maximum</option>
                      <option value="count">Count</option>
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formula</label>
                  <input
                    type="text"
                    value={formData.formula}
                    onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono"
                    placeholder="e.g., KF_001 + KF_002 * 0.8"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use key figure codes in formulas (e.g., KF_001, KF_002)
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., USD, units"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Format</label>
                  <select
                    value={formData.display_format}
                    onChange={(e) => setFormData({ ...formData, display_format: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="number">Number</option>
                    <option value="currency">Currency</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={2}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingKeyFigure(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyFigureConfig;



