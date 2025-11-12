import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle,
  Calendar,
  Truck,
  BarChart3,
  Users
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { chartData, inventoryData, productionOrders, capacityResources } from '../data/mockData';

const Dashboard: React.FC = () => {
  const stats = [
    {
      name: 'Total Inventory Value',
      value: '$2.4M',
      change: '+12%',
      changeType: 'increase',
      icon: Package
    },
    {
      name: 'Active Production Orders',
      value: '23',
      change: '+3',
      changeType: 'increase',
      icon: Calendar
    },
    {
      name: 'Low Stock Alerts',
      value: '7',
      change: '-2',
      changeType: 'decrease',
      icon: AlertTriangle
    },
    {
      name: 'Distribution Routes',
      value: '12',
      change: '+1',
      changeType: 'increase',
      icon: Truck
    }
  ];

  const lowStockItems = inventoryData.filter(item => item.currentStock <= item.minStock);
  const urgentOrders = productionOrders.filter(order => order.priority === 'urgent' || order.status === 'delayed');

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {stat.changeType === 'increase' ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demand vs Production Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Demand vs Production Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="demand" stroke="#3B82F6" strokeWidth={2} name="Demand" />
              <Line type="monotone" dataKey="production" stroke="#10B981" strokeWidth={2} name="Production" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Capacity Utilization Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacity Utilization</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={capacityResources}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="utilized" fill="#3B82F6" name="Utilized" />
              <Bar dataKey="capacity" fill="#E5E7EB" name="Total Capacity" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h3>
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {lowStockItems.length} items
            </span>
          </div>
          <div className="space-y-3">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600">
                    {item.currentStock} {item.unit}
                  </p>
                  <p className="text-xs text-gray-500">Min: {item.minStock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Urgent Production Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Urgent Production Orders</h3>
            <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {urgentOrders.length} orders
            </span>
          </div>
          <div className="space-y-3">
            {urgentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{order.product}</p>
                  <p className="text-sm text-gray-600">Order: {order.id}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    order.status === 'delayed' 
                      ? 'bg-red-100 text-red-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {order.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{order.priority} priority</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;