import React, { useState, useEffect } from 'react';
import { RefreshCw, Save } from 'lucide-react';
import { apiService } from '../../services/api';
import type { PlanningVersion, TimeSetting, KeyFigure, PlanningGrid as PlanningGridType } from '../../types/planningBook';

interface PlanningGridProps {
  version: PlanningVersion | null;
  timeSetting: TimeSetting | null;
  keyFigures: KeyFigure[];
  onRefresh: () => void;
}

const PlanningGrid: React.FC<PlanningGridProps> = ({
  version,
  timeSetting,
  keyFigures,
  onRefresh
}) => {
  const [gridData, setGridData] = useState<PlanningGridType | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; colIndex: number } | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, number>>({});

  useEffect(() => {
    if (version && timeSetting) {
      loadGridData();
    }
  }, [version, timeSetting]);

  const loadGridData = async () => {
    if (!version || !timeSetting) return;
    try {
      setLoading(true);
      const keyFigureIds = keyFigures.map(kf => kf.id).join(',');
      const response = await apiService.getPlanningDataGrid({
        version_id: version.id,
        time_setting_id: timeSetting.id,
        key_figures: keyFigureIds
      });
      const transformed: PlanningGridType = {
        columns: (response.columns || []).map((col: any) => ({
          period: col.period,
          type: col.type,
          label: col.label,
          date: col.date ? new Date(col.date) : new Date()
        })),
        rows: (response.rows || []).map((row: any) => ({
          keyFigureId: row.key_figure_id,
          keyFigureCode: row.key_figure_code,
          keyFigureName: row.key_figure_name,
          keyFigureType: row.key_figure_type,
          unit: row.unit,
          values: (row.values || []).map((cell: any) => ({
            period: cell.period,
            type: cell.type,
            value: Number(cell.value ?? 0),
            unit: cell.unit,
            notes: cell.notes,
            dataId: cell.data_id
          }))
        }))
      };
      setGridData(transformed);
    } catch (error) {
      console.error('Failed to load grid data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCellEdit = (rowIndex: number, colIndex: number, value: number) => {
    if (!gridData) return;
    const cellKey = `${rowIndex}-${colIndex}`;
    setEditedValues({ ...editedValues, [cellKey]: value });
  };

  const handleSave = async () => {
    if (!version || !gridData) return;
    try {
      const updates = Object.entries(editedValues).map(([key, value]) => {
        const [rowIndex, colIndex] = key.split('-').map(Number);
        const row = gridData.rows[rowIndex];
        const col = gridData.columns[colIndex];
        return {
          version_id: version.id,
          key_figure_id: row.keyFigureId,
          time_period: col.period,
          period_type: col.type,
          value: value
        };
      });

      await apiService.bulkUpdatePlanningData({
        version_id: version.id,
        updates
      });

      setEditedValues({});
      loadGridData();
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save changes');
    }
  };

  if (!version || !timeSetting) {
    return (
      <div className="text-center py-8 text-gray-500">
        Please select a version and time setting to view the planning grid.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!gridData || gridData.rows.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No planning data available. Create key figures and add data to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Planning Grid</h3>
          <p className="text-sm text-gray-500">
            Version: {version.name} | Time Setting: {timeSetting.name}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadGridData}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          {Object.keys(editedValues).length > 0 && (
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes ({Object.keys(editedValues).length})
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50 z-10 border-r">
                Key Figure
              </th>
              {gridData.columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase min-w-[120px]"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {gridData.rows.map((row, rowIndex) => (
              <tr key={row.keyFigureId} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r">
                  <div>
                    <div className="font-medium">{row.keyFigureName}</div>
                    <div className="text-xs text-gray-500">{row.keyFigureCode}</div>
                  </div>
                </td>
                {row.values.map((cell, colIndex) => {
                  const cellKey = `${rowIndex}-${colIndex}`;
                  const editedValue = editedValues[cellKey];
                  const displayValue = editedValue !== undefined ? editedValue : cell.value;
                  const isEdited = editedValue !== undefined;

                  return (
                    <td
                      key={colIndex}
                      className={`px-4 py-3 text-sm text-center ${
                        isEdited ? 'bg-yellow-50' : ''
                      }`}
                    >
                      {editingCell?.rowIndex === rowIndex && editingCell?.colIndex === colIndex ? (
                        <input
                          type="number"
                          value={displayValue}
                          onChange={(e) => handleCellEdit(rowIndex, colIndex, parseFloat(e.target.value) || 0)}
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setEditingCell(null);
                            }
                          }}
                          className="w-full px-2 py-1 border border-blue-500 rounded text-center"
                          autoFocus
                        />
                      ) : (
                        <div
                          onClick={() => {
                            if (version.status !== 'locked') {
                              setEditingCell({ rowIndex, colIndex });
                            }
                          }}
                          className={`cursor-pointer hover:bg-blue-50 p-1 rounded ${
                            version.status === 'locked' ? 'cursor-not-allowed opacity-50' : ''
                          }`}
                        >
                          {displayValue.toLocaleString()}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlanningGrid;



