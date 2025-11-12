import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { apiService } from '../../services/api';
import type { PlanningVersion, TimeSetting } from '../../types/planningBook';

interface ChartsViewProps {
  version: PlanningVersion | null;
  timeSetting: TimeSetting | null;
}

const ChartsView: React.FC<ChartsViewProps> = ({ version, timeSetting }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (version && timeSetting) {
      loadChartData();
    }
  }, [version, timeSetting]);

  const loadChartData = async () => {
    if (!version || !timeSetting) return;
    try {
      setLoading(true);
      // Get planning data for chart
      const response = await apiService.getPlanningDataGrid({
        version_id: version.id,
        time_setting_id: timeSetting.id
      });

      // Transform data for charts
      if (response.rows && response.columns) {
        const columns = (response.columns || []).map((col: any) => ({
          period: col.period,
          label: col.label || col.period
        }));

        const rows = (response.rows || []).map((row: any) => ({
          name: row.key_figure_name || row.keyFigureName || row.key_figure_code || row.keyFigureCode,
          values: (row.values || []).map((cell: any) => Number(cell.value ?? 0))
        }));

        const transformed = columns.map((col: any, colIndex: number) => {
          const dataPoint: any = { period: col.label };
          rows.forEach((row: any) => {
            const value = row.values[colIndex];
            dataPoint[row.name] = value !== undefined ? value : 0;
          });
          return dataPoint;
        });
        setChartData(transformed);
      }
    } catch (error) {
      console.error('Failed to load chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!version || !timeSetting) {
    return (
      <div className="text-center py-8 text-gray-500">
        Please select a version and time setting to view charts.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available for charts. Add planning data to visualize trends.
      </div>
    );
  }

  // Get unique key figure names for chart series
  const keyFigureNames = Array.from(
    new Set(
      chartData.flatMap((d: any) => Object.keys(d).filter(k => k !== 'period'))
    )
  );

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Planning Trends</h3>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              {keyFigureNames.slice(0, 6).map((name, index) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  name={name}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Planning Comparison</h3>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              {keyFigureNames.slice(0, 6).map((name, index) => (
                <Bar
                  key={name}
                  dataKey={name}
                  fill={colors[index % colors.length]}
                  name={name}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChartsView;



