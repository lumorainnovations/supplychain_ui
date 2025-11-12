import React, { useState } from 'react';
import Layout from './Layout';
import Dashboard from './Dashboard';
import DemandForecasting from './DemandForecasting';
import InventoryManagement from './InventoryManagement';
import ProductionPlanning from './ProductionPlanning';
import OrderManagement from './OrderManagement';
import BOMManagement from './BOMManagement';
import SupplierManagement from './SupplierManagement';
import UserManagement from './UserManagement';
import CapacityModeling from './CapacityModeling';
import DistributionPlanning from './DistributionPlanning';
import Integration from './Integration';
import PlanningBookMain from './PlanningBook/PlanningBookMain';

const Settings = () => (
  <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
    <h3 className="text-xl font-semibold text-gray-900 mb-2">System Settings</h3>
    <p className="text-gray-600">Application configuration and preferences coming soon...</p>
  </div>
);

function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'demand':
        return <DemandForecasting />;
      case 'inventory':
        return <InventoryManagement />;
      case 'distribution':
        return <DistributionPlanning />;
      case 'production':
        return <ProductionPlanning />;
      case 'orders':
        return <OrderManagement />;
      case 'capacity':
        return <CapacityModeling />;
      case 'bom':
        return <BOMManagement />;
      case 'suppliers':
        return <SupplierManagement />;
      case 'integration':
        return <Integration />;
      case 'users':
        return <UserManagement />;
      case 'planning-book':
        return <PlanningBookMain />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default MainApp;