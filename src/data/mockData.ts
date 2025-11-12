import { 
  InventoryItem, 
  DemandForecast, 
  ProductionOrder, 
  BillOfMaterial, 
  DistributionRoute, 
  CapacityResource,
  User,
  Supplier,
  Customer,
  SalesOrder,
  PurchaseOrder,
  Location
} from '../types';

export const currentUser: User = {
  id: '1',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@company.com',
  role: 'admin',
  department: 'Operations',
  avatar: 'SJ',
  status: 'active',
  jobTitle: 'Operations Manager',
  hireDate: '2022-01-15',
  lastLogin: '2024-01-20T10:30:00Z',
  permissions: ['inventory.read', 'inventory.write', 'orders.read', 'orders.write', 'users.read', 'users.write']
};

export const users: User[] = [
  {
    id: 'USR-001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+1-555-0101',
    role: 'admin',
    department: 'Operations',
    status: 'active',
    avatar: 'SJ',
    jobTitle: 'Operations Manager',
    hireDate: '2022-01-15',
    lastLogin: '2024-01-20T10:30:00Z',
    permissions: ['inventory.read', 'inventory.write', 'orders.read', 'orders.write', 'users.read', 'users.write']
  },
  {
    id: 'USR-002',
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    phone: '+1-555-0102',
    role: 'manager',
    department: 'Manufacturing',
    status: 'active',
    avatar: 'MC',
    jobTitle: 'Production Manager',
    hireDate: '2022-03-20',
    lastLogin: '2024-01-19T15:45:00Z',
    permissions: ['inventory.read', 'orders.read', 'orders.write', 'production.read', 'production.write']
  },
  {
    id: 'USR-003',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@company.com',
    phone: '+1-555-0103',
    role: 'operator',
    department: 'Quality Control',
    status: 'active',
    avatar: 'ER',
    jobTitle: 'QC Specialist',
    hireDate: '2023-06-10',
    lastLogin: '2024-01-20T09:15:00Z',
    permissions: ['inventory.read', 'orders.read', 'reports.read']
  },
  {
    id: 'USR-004',
    name: 'David Wilson',
    email: 'david.wilson@company.com',
    phone: '+1-555-0104',
    role: 'operator',
    department: 'Logistics',
    status: 'active',
    avatar: 'DW',
    jobTitle: 'Warehouse Supervisor',
    hireDate: '2022-11-05',
    lastLogin: '2024-01-18T14:20:00Z',
    permissions: ['inventory.read', 'inventory.write', 'orders.read']
  },
  {
    id: 'USR-005',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@company.com',
    phone: '+1-555-0105',
    role: 'viewer',
    department: 'Finance',
    status: 'active',
    avatar: 'LT',
    jobTitle: 'Financial Analyst',
    hireDate: '2023-02-14',
    lastLogin: '2024-01-19T11:30:00Z',
    permissions: ['reports.read']
  },
  {
    id: 'USR-006',
    name: 'Robert Brown',
    email: 'robert.brown@company.com',
    phone: '+1-555-0106',
    role: 'manager',
    department: 'Procurement',
    status: 'inactive',
    avatar: 'RB',
    jobTitle: 'Procurement Manager',
    hireDate: '2021-09-01',
    lastLogin: '2024-01-10T16:45:00Z',
    permissions: ['inventory.read', 'orders.read', 'orders.write']
  },
  {
    id: 'USR-007',
    name: 'Jennifer Davis',
    email: 'jennifer.davis@company.com',
    phone: '+1-555-0107',
    role: 'operator',
    department: 'Sales',
    status: 'suspended',
    avatar: 'JD',
    jobTitle: 'Sales Representative',
    hireDate: '2023-08-22',
    lastLogin: '2024-01-15T13:10:00Z',
    permissions: ['orders.read']
  },
  {
    id: 'USR-008',
    name: 'Alex Martinez',
    email: 'alex.martinez@company.com',
    phone: '+1-555-0108',
    role: 'operator',
    department: 'IT',
    status: 'active',
    avatar: 'AM',
    jobTitle: 'System Administrator',
    hireDate: '2022-07-18',
    lastLogin: '2024-01-20T08:00:00Z',
    permissions: ['settings.read', 'settings.write', 'users.read']
  }
];

export const inventoryData: InventoryItem[] = [
  {
    id: '1',
    name: 'Steel Sheet 1mm',
    sku: 'STL-001',
    category: 'Raw Materials',
    currentStock: 150,
    minStock: 50,
    maxStock: 300,
    unit: 'sheets',
    lastRestocked: '2024-01-15',
    supplier: 'MetalCorp Inc.',
    cost: 25.50,
    location: 'Warehouse A',
    description: 'High-grade steel sheets for manufacturing'
  },
  {
    id: '2',
    name: 'Electric Motor 5HP',
    sku: 'MTR-005',
    category: 'Components',
    currentStock: 12,
    minStock: 20,
    maxStock: 50,
    unit: 'units',
    lastRestocked: '2024-01-10',
    supplier: 'PowerTech Ltd.',
    cost: 450.00,
    location: 'Warehouse B',
    description: '5HP electric motor for industrial applications'
  },
  {
    id: '3',
    name: 'Industrial Bearing',
    sku: 'BRG-101',
    category: 'Components',
    currentStock: 75,
    minStock: 30,
    maxStock: 100,
    unit: 'units',
    lastRestocked: '2024-01-18',
    supplier: 'BearingCorp',
    cost: 15.75,
    location: 'Warehouse A',
    description: 'Heavy-duty industrial bearings'
  }
];

export const demandForecastData: DemandForecast[] = [
  {
    id: '1',
    product: 'Product A',
    period: '2024-02',
    predicted: 450,
    actual: 425,
    confidence: 85,
    trend: 'up',
    method: 'Linear Regression',
    lastUpdated: '2024-01-20'
  },
  {
    id: '2',
    product: 'Product B',
    period: '2024-02',
    predicted: 320,
    actual: 340,
    confidence: 78,
    trend: 'stable',
    method: 'Moving Average',
    lastUpdated: '2024-01-20'
  },
  {
    id: '3',
    product: 'Product C',
    period: '2024-02',
    predicted: 280,
    confidence: 92,
    trend: 'down',
    method: 'Exponential Smoothing',
    lastUpdated: '2024-01-20'
  }
];

export const productionOrders: ProductionOrder[] = [
  {
    id: 'PO-001',
    product: 'Industrial Pump',
    quantity: 50,
    startDate: '2024-01-20',
    endDate: '2024-01-25',
    status: 'in-progress',
    priority: 'high',
    assignedTo: 'Production Team A',
    progress: 65,
    notes: 'On schedule, quality checks passed'
  },
  {
    id: 'PO-002',
    product: 'Control Panel',
    quantity: 25,
    startDate: '2024-01-22',
    endDate: '2024-01-28',
    status: 'planned',
    priority: 'medium',
    assignedTo: 'Production Team B',
    progress: 0,
    notes: 'Waiting for materials'
  },
  {
    id: 'PO-003',
    product: 'Motor Assembly',
    quantity: 100,
    startDate: '2024-01-18',
    endDate: '2024-01-24',
    status: 'delayed',
    priority: 'urgent',
    assignedTo: 'Production Team C',
    progress: 30,
    notes: 'Delayed due to supplier issues'
  }
];

export const billOfMaterials: BillOfMaterial[] = [
  {
    id: 'BOM-001',
    product: 'Industrial Pump',
    version: 'v2.1',
    components: [
      { id: '1', name: 'Steel Casing', quantity: 1, unit: 'unit', cost: 45.00 },
      { id: '2', name: 'Electric Motor 5HP', quantity: 1, unit: 'unit', cost: 450.00 },
      { id: '3', name: 'Impeller', quantity: 1, unit: 'unit', cost: 75.00 },
      { id: '4', name: 'Seal Kit', quantity: 1, unit: 'kit', cost: 25.00 }
    ],
    totalCost: 595.00,
    lastUpdated: '2024-01-15',
    status: 'active'
  },
  {
    id: 'BOM-002',
    product: 'Control Panel',
    version: 'v1.3',
    components: [
      { id: '5', name: 'Metal Enclosure', quantity: 1, unit: 'unit', cost: 85.00 },
      { id: '6', name: 'Circuit Board', quantity: 2, unit: 'unit', cost: 120.00 },
      { id: '7', name: 'Display Unit', quantity: 1, unit: 'unit', cost: 200.00 },
      { id: '8', name: 'Wiring Harness', quantity: 1, unit: 'set', cost: 45.00 }
    ],
    totalCost: 450.00,
    lastUpdated: '2024-01-12',
    status: 'active'
  }
];

export const distributionRoutes: DistributionRoute[] = [
  {
    id: 'RT-001',
    name: 'Northeast Express Route',
    origin: 'Main Distribution Center - Boston',
    destinations: ['New York, NY', 'Philadelphia, PA', 'Hartford, CT', 'Providence, RI'],
    distance: 850,
    estimatedTime: '2 days',
    cost: 1450.00,
    capacity: 5000,
    status: 'active',
    vehicle: 'Truck-001 (Freightliner Cascadia)',
    driver: 'John Smith',
    priority: 'high',
    scheduledDate: '2024-01-22',
    actualDate: '2024-01-22',
    deliveryType: 'express',
    customerType: 'wholesale',
    notes: 'High-priority route for major wholesale customers'
  },
  {
    id: 'RT-002',
    name: 'West Coast Standard Route',
    origin: 'Main Distribution Center - Los Angeles',
    destinations: ['San Francisco, CA', 'Sacramento, CA', 'San Jose, CA', 'Fresno, CA'],
    distance: 1200,
    estimatedTime: '3 days',
    cost: 1850.00,
    capacity: 7500,
    status: 'in-transit',
    vehicle: 'Truck-002 (Volvo VNL)',
    driver: 'Mike Johnson',
    priority: 'medium',
    scheduledDate: '2024-01-20',
    actualDate: '2024-01-20',
    deliveryType: 'standard',
    customerType: 'retail',
    notes: 'Regular retail delivery route'
  },
  {
    id: 'RT-003',
    name: 'Southeast Overnight Route',
    origin: 'Regional Hub - Atlanta',
    destinations: ['Miami, FL', 'Tampa, FL', 'Jacksonville, FL', 'Orlando, FL'],
    distance: 650,
    estimatedTime: '1 day',
    cost: 2200.00,
    capacity: 3000,
    status: 'planned',
    vehicle: 'Truck-003 (Peterbilt 579)',
    driver: 'Sarah Williams',
    priority: 'urgent',
    scheduledDate: '2024-01-23',
    deliveryType: 'overnight',
    customerType: 'distributor',
    notes: 'Urgent overnight delivery for distributor network'
  },
  {
    id: 'RT-004',
    name: 'Midwest Regional Route',
    origin: 'Central Hub - Chicago',
    destinations: ['Detroit, MI', 'Milwaukee, WI', 'Indianapolis, IN', 'Columbus, OH'],
    distance: 980,
    estimatedTime: '2.5 days',
    cost: 1650.00,
    capacity: 6000,
    status: 'completed',
    vehicle: 'Truck-004 (Kenworth T680)',
    driver: 'Robert Davis',
    priority: 'medium',
    scheduledDate: '2024-01-18',
    actualDate: '2024-01-18',
    deliveryType: 'standard',
    customerType: 'wholesale',
    notes: 'Completed successfully, all deliveries on time'
  },
  {
    id: 'RT-005',
    name: 'Texas Same-Day Route',
    origin: 'Local Hub - Dallas',
    destinations: ['Fort Worth, TX', 'Arlington, TX', 'Plano, TX'],
    distance: 120,
    estimatedTime: '8 hours',
    cost: 850.00,
    capacity: 2000,
    status: 'active',
    vehicle: 'Van-001 (Mercedes Sprinter)',
    driver: 'Lisa Garcia',
    priority: 'urgent',
    scheduledDate: '2024-01-21',
    actualDate: '2024-01-21',
    deliveryType: 'same-day',
    customerType: 'retail',
    notes: 'Same-day delivery service for premium customers'
  },
  {
    id: 'RT-006',
    name: 'Mountain West Route',
    origin: 'Western Hub - Denver',
    destinations: ['Salt Lake City, UT', 'Phoenix, AZ', 'Albuquerque, NM', 'Las Vegas, NV'],
    distance: 1450,
    estimatedTime: '4 days',
    cost: 2100.00,
    capacity: 8000,
    status: 'inactive',
    vehicle: 'Truck-005 (Mack Anthem)',
    driver: 'Tom Anderson',
    priority: 'low',
    scheduledDate: '2024-01-25',
    deliveryType: 'standard',
    customerType: 'distributor',
    notes: 'Route temporarily suspended due to weather conditions'
  }
];

export const capacityResources: CapacityResource[] = [
  {
    id: 'RES-001',
    name: 'CNC Machine #1',
    type: 'machine',
    capacity: 100,
    utilized: 85,
    efficiency: 92,
    department: 'Manufacturing',
    status: 'operational',
    location: 'Factory Floor A',
    cost: 150000
  },
  {
    id: 'RES-002',
    name: 'Assembly Line A',
    type: 'facility',
    capacity: 200,
    utilized: 160,
    efficiency: 88,
    department: 'Assembly',
    status: 'operational',
    location: 'Factory Floor B',
    cost: 250000
  },
  {
    id: 'RES-003',
    name: 'Quality Control Team',
    type: 'labor',
    capacity: 50,
    utilized: 45,
    efficiency: 95,
    department: 'Quality',
    status: 'operational',
    location: 'QC Department',
    cost: 75000
  }
];

export const suppliers: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'MetalCorp Inc.',
    contact: 'Robert Wilson',
    email: 'robert@metalcorp.com',
    phone: '+1-555-0101',
    address: '123 Industrial Ave, Detroit, MI',
    rating: 4.5,
    status: 'active',
    paymentTerms: 'Net 30'
  },
  {
    id: 'SUP-002',
    name: 'PowerTech Ltd.',
    contact: 'Lisa Chen',
    email: 'lisa@powertech.com',
    phone: '+1-555-0102',
    address: '456 Tech Blvd, San Jose, CA',
    rating: 4.8,
    status: 'active',
    paymentTerms: 'Net 45'
  },
  {
    id: 'SUP-003',
    name: 'BearingCorp',
    contact: 'David Brown',
    email: 'david@bearingcorp.com',
    phone: '+1-555-0103',
    address: '789 Manufacturing St, Chicago, IL',
    rating: 4.2,
    status: 'active',
    paymentTerms: 'Net 30'
  }
];

export const customers: Customer[] = [
  {
    id: 'CUST-001',
    name: 'ABC Manufacturing',
    contact: 'Jennifer Davis',
    email: 'jennifer@abcmfg.com',
    phone: '+1-555-0201',
    address: '321 Business Park, Houston, TX',
    creditLimit: 50000,
    status: 'active',
    type: 'wholesale'
  },
  {
    id: 'CUST-002',
    name: 'XYZ Industries',
    contact: 'Michael Rodriguez',
    email: 'michael@xyzind.com',
    phone: '+1-555-0202',
    address: '654 Corporate Dr, Atlanta, GA',
    creditLimit: 75000,
    status: 'active',
    type: 'distributor'
  }
];

export const salesOrders: SalesOrder[] = [
  {
    id: 'SO-001',
    customer: 'ABC Manufacturing',
    items: [
      { product: 'Industrial Pump', quantity: 5, price: 1200.00 },
      { product: 'Control Panel', quantity: 3, price: 800.00 }
    ],
    orderDate: '2024-01-15',
    deliveryDate: '2024-01-30',
    status: 'confirmed',
    total: 8400.00,
    priority: 'high'
  },
  {
    id: 'SO-002',
    customer: 'XYZ Industries',
    items: [
      { product: 'Motor Assembly', quantity: 10, price: 950.00 }
    ],
    orderDate: '2024-01-18',
    deliveryDate: '2024-02-05',
    status: 'pending',
    total: 9500.00,
    priority: 'medium'
  }
];

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: 'PUR-001',
    supplier: 'MetalCorp Inc.',
    items: [
      { product: 'Steel Sheet 1mm', quantity: 100, price: 25.50 }
    ],
    orderDate: '2024-01-10',
    expectedDate: '2024-01-25',
    status: 'approved',
    total: 2550.00
  },
  {
    id: 'PUR-002',
    supplier: 'PowerTech Ltd.',
    items: [
      { product: 'Electric Motor 5HP', quantity: 20, price: 450.00 }
    ],
    orderDate: '2024-01-12',
    expectedDate: '2024-01-28',
    status: 'pending',
    total: 9000.00
  }
];

export const locations: Location[] = [
  {
    id: 'LOC-001',
    name: 'Main Warehouse',
    type: 'warehouse',
    address: '100 Storage Way, Industrial District',
    capacity: 10000,
    manager: 'Tom Anderson',
    status: 'active'
  },
  {
    id: 'LOC-002',
    name: 'Factory Floor A',
    type: 'factory',
    address: '200 Manufacturing Blvd, Industrial District',
    capacity: 5000,
    manager: 'Sarah Wilson',
    status: 'active'
  },
  {
    id: 'LOC-003',
    name: 'Retail Store Downtown',
    type: 'store',
    address: '300 Main Street, Downtown',
    capacity: 1000,
    manager: 'Alex Johnson',
    status: 'active'
  }
];

export const chartData = [
  { name: 'Jan', demand: 400, production: 380, inventory: 120 },
  { name: 'Feb', demand: 450, production: 425, inventory: 95 },
  { name: 'Mar', demand: 380, production: 400, inventory: 115 },
  { name: 'Apr', demand: 520, production: 500, inventory: 95 },
  { name: 'May', demand: 480, production: 490, inventory: 105 },
  { name: 'Jun', demand: 420, production: 440, inventory: 125 }
];