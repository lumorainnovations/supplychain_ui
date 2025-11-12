export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  department: string;
  status?: 'active' | 'inactive' | 'suspended';
  avatar: string;
  jobTitle?: string;
  hireDate?: string;
  lastLogin?: string;
  permissions?: string[];
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  lastRestocked: string;
  supplier: string;
  cost: number;
  location?: string;
  description?: string;
}

export interface DemandForecast {
  id: string;
  product: string;
  period: string;
  predicted: number;
  actual?: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  method: string;
  lastUpdated: string;
}

export interface ProductionOrder {
  id: string;
  product: string;
  quantity: number;
  startDate: string;
  endDate: string;
  status: 'planned' | 'in-progress' | 'completed' | 'delayed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  progress?: number;
  notes?: string;
}

export interface BillOfMaterial {
  id: string;
  product: string;
  version: string;
  components: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    cost: number;
  }[];
  totalCost: number;
  lastUpdated: string;
  status: 'active' | 'draft' | 'obsolete';
}

export interface DistributionRoute {
  id: string;
  name: string;
  origin: string;
  destinations: string[];
  distance: number;
  estimatedTime: string;
  cost: number;
  capacity: number;
  status: 'active' | 'inactive' | 'planned' | 'in-transit' | 'completed';
  vehicle?: string;
  driver?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledDate?: string;
  actualDate?: string;
  notes?: string;
  deliveryType: 'standard' | 'express' | 'overnight' | 'same-day';
  customerType: 'retail' | 'wholesale' | 'distributor';
}

export interface CapacityResource {
  id: string;
  name: string;
  type: 'machine' | 'labor' | 'facility';
  capacity: number;
  utilized: number;
  efficiency: number;
  department: string;
  status: 'operational' | 'maintenance' | 'offline';
  location?: string;
  cost?: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  status: 'active' | 'inactive';
  paymentTerms: string;
}

export interface Customer {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  creditLimit: number;
  status: 'active' | 'inactive';
  type: 'retail' | 'wholesale' | 'distributor';
}

export interface SalesOrder {
  id: string;
  customer: string;
  items: {
    product: string;
    quantity: number;
    price: number;
  }[];
  orderDate: string;
  deliveryDate: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  items: {
    product: string;
    quantity: number;
    price: number;
  }[];
  orderDate: string;
  expectedDate: string;
  status: 'pending' | 'approved' | 'received' | 'cancelled';
  total: number;
}

export interface Location {
  id: string;
  name: string;
  type: 'warehouse' | 'store' | 'factory' | 'office';
  address: string;
  capacity: number;
  manager: string;
  status: 'active' | 'inactive';
}

// Planning Book types
export * from './planningBook';