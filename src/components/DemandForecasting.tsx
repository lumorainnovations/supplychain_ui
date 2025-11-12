import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3, Download, Upload, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { chartData } from '../data/mockData';
import type { DemandForecast } from '../types';
import apiService from '../services/api';

const DemandForecasting: React.FC = () => {
  const [forecasts, setForecasts] = useState<DemandForecast[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForecasts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiService.getDemandForecasts();
        setForecasts(response.forecasts || []);
      } catch (err: any) {
        setError('Failed to fetch demand forecasts');
      } finally {
        setIsLoading(false);
      }
    };
    fetchForecasts();
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const generateForecast = async () => {
    setIsGenerating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate new forecasts with realistic data
    const products = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'];
    const methods = ['Linear Regression', 'Moving Average', 'Exponential Smoothing', 'ARIMA', 'Neural Network'];
    const trends = ['up', 'down', 'stable'];
    
    const newForecasts = products.map((product, index) => {
      const baseValue = 200 + Math.random() * 400;
      const trend = trends[Math.floor(Math.random() * trends.length)];
      const confidence = 70 + Math.random() * 25;
      
      return {
        id: `forecast-${Date.now()}-${index}`,
        product,
        period: '2024-03',
        predicted: Math.round(baseValue),
        confidence: Math.round(confidence),
        trend: trend as 'up' | 'down' | 'stable',
        method: methods[Math.floor(Math.random() * methods.length)],
        lastUpdated: new Date().toISOString().split('T')[0]
      };
    });
    
    setForecasts(newForecasts);
    setIsGenerating(false);
  };

  const exportToCSV = () => {
    const headers = ['Product', 'Period', 'Predicted', 'Actual', 'Confidence', 'Trend', 'Method', 'Last Updated'];
    const csvContent = [
      headers.join(','),
      ...forecasts.map(forecast => [
        forecast.product,
        forecast.period,
        forecast.predicted,
        forecast.actual || '',
        forecast.confidence,
        forecast.trend,
        forecast.method,
        forecast.lastUpdated
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `demand_forecasts_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      
      const importedForecasts = lines.slice(1)
        .filter(line => line.trim())
        .map((line, index) => {
          const values = line.split(',');
          return {
            id: `imported-${Date.now()}-${index}`,
            product: values[0] || '',
            period: values[1] || '',
            predicted: parseInt(values[2]) || 0,
            actual: values[3] ? parseInt(values[3]) : undefined,
            confidence: parseInt(values[4]) || 0,
            trend: (values[5] as 'up' | 'down' | 'stable') || 'stable',
            method: values[6] || 'Imported',
            lastUpdated: values[7] || new Date().toISOString().split('T')[0]
          };
        });

      setForecasts(prev => [...prev, ...importedForecasts]);
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  const forecastChartData = [
    { month: 'Jan', actual: 400, predicted: 380, confidence: 85 },
    { month: 'Feb', actual: 450, predicted: 425, confidence: 78 },
    { month: 'Mar', actual: 380, predicted: 400, confidence: 92 },
    { month: 'Apr', actual: 520, predicted: 500, confidence: 88 },
    { month: 'May', actual: null, predicted: 490, confidence: 82 },
    { month: 'Jun', actual: null, predicted: 520, confidence: 79 },
  ];

  if (isLoading) {
    return <div className="p-6">Loading demand forecasts...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Demand Forecasting</h2>
            <p className="text-gray-600 mt-1">Predict future demand using advanced analytics and machine learning</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={generateForecast}
              disabled={isGenerating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating...' : 'Generate Forecast'}</span>
            </button>
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="csv-import"
              />
              <label
                htmlFor="csv-import"
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
          </div>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Demand Prediction vs Actual</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Predicted</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Actual</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={forecastChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="predicted" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Predicted" />
            <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2} name="Actual" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {forecasts.map((forecast) => (
          <div key={forecast.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">{forecast.product}</h4>
              {getTrendIcon(forecast.trend)}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Predicted Demand:</span>
                <span className="font-medium">{forecast.predicted.toLocaleString()} units</span>
              </div>
              {forecast.actual && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Actual Demand:</span>
                  <span className="font-medium">{forecast.actual.toLocaleString()} units</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Confidence:</span>
                <span className="font-medium">{forecast.confidence}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Trend:</span>
                <span className={`font-medium capitalize ${getTrendColor(forecast.trend)}`}>
                  {forecast.trend}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Method:</span>
                <span className="font-medium text-xs">{forecast.method}</span>
              </div>
            </div>
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${forecast.confidence}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Forecast Accuracy Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Forecast Accuracy Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Mean Absolute Error (MAE):</span>
              <span className="font-semibold text-green-600">12.3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Mean Absolute Percentage Error (MAPE):</span>
              <span className="font-semibold text-green-600">3.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Root Mean Square Error (RMSE):</span>
              <span className="font-semibold text-yellow-600">18.7</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Forecast Bias:</span>
              <span className="font-semibold text-blue-600">-2.1%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Accuracy</span>
                <span>87%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Short-term (1-3 months)</span>
                <span>92%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Long-term (6+ months)</span>
                <span>74%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '74%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forecasting Methods */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Forecasting Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <h4 className="font-medium text-blue-900 mb-2">Statistical Methods</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Linear Regression</li>
              <li>• Moving Average</li>
              <li>• Exponential Smoothing</li>
              <li>• ARIMA Models</li>
            </ul>
          </div>
          
          <div className="border border-green-200 rounded-lg p-4 bg-green-50">
            <h4 className="font-medium text-green-900 mb-2">Machine Learning</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Neural Networks</li>
              <li>• Random Forest</li>
              <li>• Support Vector Machines</li>
              <li>• Ensemble Methods</li>
            </ul>
          </div>
          
          <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
            <h4 className="font-medium text-orange-900 mb-2">Advanced Analytics</h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• Seasonal Decomposition</li>
              <li>• Trend Analysis</li>
              <li>• Causal Modeling</li>
              <li>• Scenario Planning</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandForecasting;