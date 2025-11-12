import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type { ProductionOrder } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
//const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://34.227.161.19:3001/api';

export function formatDateToYMD(date: string): string {
  if (!date) return '';
  // If already in yyyy-MM-dd, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  // If in dd-MM-yyyy, convert to yyyy-MM-dd
  if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
    const [day, month, year] = date.split('-');
    return `${year}-${month}-${day}`;
  }
  // Otherwise, try to parse and format
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toSnakeCaseOrder(data: any) {
  return {
    product: data.product,
    quantity: data.quantity,
    start_date: data.startDate,
    end_date: data.endDate,
    status: data.status,
    priority: data.priority,
    assigned_to: data.assignedTo,
    progress: data.progress,
    notes: data.notes
  };
}

function toSnakeCaseDistributionRoute(data: any) {
  return {
    name: data.name,
    origin: data.origin,
    destinations: JSON.stringify(data.destinations),
    distance: data.distance,
    estimated_time: data.estimatedTime,
    cost: data.cost,
    capacity: data.capacity,
    status: data.status,
    vehicle: data.vehicle,
    driver: data.driver,
    priority: data.priority,
    scheduled_date: data.scheduledDate,
    actual_date: data.actualDate,
    notes: data.notes,
    delivery_type: data.deliveryType,
    customer_type: data.customerType
  };
}

function cleanUndefined(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === undefined ? null : v])
  );
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true // Always send cookies for authentication
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async register(userData: any) {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async refreshToken(token: string) {
    const response = await this.api.post('/auth/refresh', { token });
    return response.data;
  }

  // Dashboard
  async getDashboardSummary() {
    const response = await this.api.get('/dashboard/summary');
    return response.data;
  }

  async getChartData(type: string) {
    const response = await this.api.get(`/dashboard/charts/${type}`);
    return response.data;
  }

  // Users
  async getUsers(params?: any) {
    const response = await this.api.get('/users', { params });
    return response.data;
  }

  async getUser(id: string) {
    const response = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async createUser(userData: any) {
    const response = await this.api.post('/users', userData);
    return response.data;
  }

  async updateUser(id: string, userData: any) {
    const response = await this.api.put(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: string) {
    const response = await this.api.delete(`/users/${id}`);
    return response.data;
  }

  async toggleUserStatus(id: string) {
    const response = await this.api.patch(`/users/${id}/toggle-status`);
    return response.data;
  }

  // Inventory
  async getInventory(params?: any) {
    const response = await this.api.get('/inventory', { params });
    return response.data;
  }

  async getInventoryItem(id: string) {
    const response = await this.api.get(`/inventory/${id}`);
    return response.data;
  }

  async createInventoryItem(itemData: any) {
    const response = await this.api.post('/inventory', itemData);
    return response.data;
  }

  async updateInventoryItem(id: string, itemData: any) {
    const response = await this.api.put(`/inventory/${id}`, itemData);
    return response.data;
  }

  async deleteInventoryItem(id: string) {
    const response = await this.api.delete(`/inventory/${id}`);
    return response.data;
  }

  async getLowStockItems() {
    const response = await this.api.get('/inventory/alerts/low-stock');
    return response.data;
  }

  async getInventoryCategories() {
    const response = await this.api.get('/inventory/meta/categories');
    return response.data;
  }

  async updateStock(id: string, quantity: number, operation: string) {
    const response = await this.api.patch(`/inventory/${id}/stock`, { quantity, operation });
    return response.data;
  }

  // Production Orders
  async getProductionOrders(params?: Record<string, unknown>) {
    const response = await this.api.get('/production', { params });
    // Map snake_case to camelCase for each order
    const orders: ProductionOrder[] = (response.data.orders || []).map((order: Record<string, unknown>) => ({
      ...order,
      startDate: order.start_date,
      endDate: order.end_date,
      assignedTo: order.assigned_to,
      // Remove snake_case fields to avoid confusion
      start_date: undefined,
      end_date: undefined,
      assigned_to: undefined
    }));
    return { ...response.data, orders };
  }

  async getProductionOrder(id: string): Promise<ProductionOrder> {
    const response = await this.api.get(`/production/${id}`);
    const order = response.data;
    // Map snake_case to camelCase for single order
    return {
      ...order,
      startDate: order.start_date,
      endDate: order.end_date,
      assignedTo: order.assigned_to,
      start_date: undefined,
      end_date: undefined,
      assigned_to: undefined
    } as ProductionOrder;
  }

  async createProductionOrder(orderData: any) {
    const data = toSnakeCaseOrder({
      ...orderData,
      startDate: formatDateToYMD(orderData.startDate),
      endDate: formatDateToYMD(orderData.endDate)
    });
    const response = await this.api.post('/production', data);
    return response.data;
  }

  async updateProductionOrder(id: string, orderData: any) {
    // Remove 'id' from the payload as backend does not allow it
    const { id: _id, ...rest } = orderData;
    const data = toSnakeCaseOrder({
      ...rest,
      startDate: formatDateToYMD(orderData.startDate),
      endDate: formatDateToYMD(orderData.endDate)
    });
    const response = await this.api.put(`/production/${id}`, data);
    return response.data;
  }

  async deleteProductionOrder(id: string) {
    const response = await this.api.delete(`/production/${id}`);
    return response.data;
  }

  // Bill of Materials
  async getBOMs(params?: any) {
    const response = await this.api.get('/bom', { params });
    return response.data;
  }

  async getBOM(id: string) {
    const response = await this.api.get(`/bom/${id}`);
    return response.data;
  }

  async createBOM(bomData: any) {
    const response = await this.api.post('/bom', bomData);
    return response.data;
  }

  async updateBOM(id: string, bomData: any) {
    const response = await this.api.put(`/bom/${id}`, bomData);
    return response.data;
  }

  async deleteBOM(id: string) {
    const response = await this.api.delete(`/bom/${id}`);
    return response.data;
  }

  // Suppliers
  async getSuppliers(params?: any) {
    const response = await this.api.get('/suppliers', { params });
    return response.data;
  }

  async getSupplier(id: string) {
    const response = await this.api.get(`/suppliers/${id}`);
    return response.data;
  }

  async createSupplier(supplierData: any) {
    const response = await this.api.post('/suppliers', supplierData);
    return response.data;
  }

  async updateSupplier(id: string, supplierData: any) {
    const response = await this.api.put(`/suppliers/${id}`, supplierData);
    return response.data;
  }

  async deleteSupplier(id: string) {
    const response = await this.api.delete(`/suppliers/${id}`);
    return response.data;
  }

  // Distribution Routes
  async getDistributionRoutes(params?: any) {
    const response = await this.api.get('/distribution', { params });
    return response.data;
  }

  async getDistributionRoute(id: string) {
    const response = await this.api.get(`/distribution/${id}`);
    return response.data;
  }

  async createDistributionRoute(routeData: any) {
    const data = toSnakeCaseDistributionRoute(routeData);
    const response = await this.api.post('/distribution', data);
    return response.data;
  }

  async updateDistributionRoute(id: string, routeData: any) {
    // Send camelCase fields, but stringify destinations and clean undefineds
    const data = {
      ...routeData,
      destinations: JSON.stringify(routeData.destinations)
    };
    const cleaned = cleanUndefined(data);
    const response = await this.api.put(`/distribution/${id}`, cleaned);
    return response.data;
  }

  async deleteDistributionRoute(id: string) {
    const response = await this.api.delete(`/distribution/${id}`);
    return response.data;
  }

  // Capacity Resources
  async getCapacityResources(params?: any) {
    const response = await this.api.get('/capacity', { params });
    return response.data;
  }

  async getCapacityResource(id: string) {
    const response = await this.api.get(`/capacity/${id}`);
    return response.data;
  }

  async createCapacityResource(resourceData: any) {
    const response = await this.api.post('/capacity', resourceData);
    return response.data;
  }

  async updateCapacityResource(id: string, resourceData: any) {
    const response = await this.api.put(`/capacity/${id}`, resourceData);
    return response.data;
  }

  async deleteCapacityResource(id: string) {
    const response = await this.api.delete(`/capacity/${id}`);
    return response.data;
  }

  // Demand Forecasting
  async getDemandForecasts(params?: any) {
    const response = await this.api.get('/demand', { params });
    return response.data;
  }

  async getDemandForecast(id: string) {
    const response = await this.api.get(`/demand/${id}`);
    return response.data;
  }

  async createDemandForecast(forecastData: any) {
    const response = await this.api.post('/demand', forecastData);
    return response.data;
  }

  async updateDemandForecast(id: string, forecastData: any) {
    const response = await this.api.put(`/demand/${id}`, forecastData);
    return response.data;
  }

  async deleteDemandForecast(id: string) {
    const response = await this.api.delete(`/demand/${id}`);
    return response.data;
  }

  // Planning Book - Time Settings
  async getTimeSettings(params?: any) {
    const response = await this.api.get('/planning-book/time-settings', { params });
    return response.data;
  }

  async getTimeSetting(id: string) {
    const response = await this.api.get(`/planning-book/time-settings/${id}`);
    return response.data;
  }

  async createTimeSetting(data: any) {
    const response = await this.api.post('/planning-book/time-settings', data);
    return response.data;
  }

  async updateTimeSetting(id: string, data: any) {
    const response = await this.api.put(`/planning-book/time-settings/${id}`, data);
    return response.data;
  }

  async deleteTimeSetting(id: string) {
    const response = await this.api.delete(`/planning-book/time-settings/${id}`);
    return response.data;
  }

  async getTimeHierarchy(id: string) {
    const response = await this.api.get(`/planning-book/time-settings/${id}/hierarchy`);
    return response.data;
  }

  async rollForwardTimeSetting(id: string) {
    const response = await this.api.post(`/planning-book/time-settings/${id}/roll-forward`);
    return response.data;
  }

  // Planning Book - Key Figures
  async getKeyFigures(params?: any) {
    const response = await this.api.get('/planning-book/key-figures', { params });
    return response.data;
  }

  async getKeyFigure(id: string) {
    const response = await this.api.get(`/planning-book/key-figures/${id}`);
    return response.data;
  }

  async createKeyFigure(data: any) {
    const response = await this.api.post('/planning-book/key-figures', data);
    return response.data;
  }

  async updateKeyFigure(id: string, data: any) {
    const response = await this.api.put(`/planning-book/key-figures/${id}`, data);
    return response.data;
  }

  async deleteKeyFigure(id: string) {
    const response = await this.api.delete(`/planning-book/key-figures/${id}`);
    return response.data;
  }

  async validateKeyFigureFormula(data: any) {
    const response = await this.api.post('/planning-book/key-figures/validate-formula', data);
    return response.data;
  }

  async getKeyFigureDependencies(id: string) {
    const response = await this.api.get(`/planning-book/key-figures/${id}/dependencies`);
    return response.data;
  }

  // Planning Book - Versions
  async getVersions(params?: any) {
    const response = await this.api.get('/planning-book/versions', { params });
    return response.data;
  }

  async getVersion(id: string) {
    const response = await this.api.get(`/planning-book/versions/${id}`);
    return response.data;
  }

  async createVersion(data: any) {
    const response = await this.api.post('/planning-book/versions', data);
    return response.data;
  }

  async updateVersion(id: string, data: any) {
    const response = await this.api.put(`/planning-book/versions/${id}`, data);
    return response.data;
  }

  async deleteVersion(id: string) {
    const response = await this.api.delete(`/planning-book/versions/${id}`);
    return response.data;
  }

  async copyVersion(id: string, data: any) {
    const response = await this.api.post(`/planning-book/versions/${id}/copy`, data);
    return response.data;
  }

  async lockVersion(id: string) {
    const response = await this.api.post(`/planning-book/versions/${id}/lock`);
    return response.data;
  }

  async unlockVersion(id: string) {
    const response = await this.api.post(`/planning-book/versions/${id}/unlock`);
    return response.data;
  }

  // Planning Book - Planning Data
  async getPlanningDataGrid(params: any) {
    const response = await this.api.get('/planning-book/planning-data/grid', { params });
    return response.data;
  }

  async getPlanningData(params?: any) {
    const response = await this.api.get('/planning-book/planning-data', { params });
    return response.data;
  }

  async upsertPlanningData(data: any) {
    const response = await this.api.post('/planning-book/planning-data', data);
    return response.data;
  }

  async bulkUpdatePlanningData(data: any) {
    const response = await this.api.post('/planning-book/planning-data/bulk-update', data);
    return response.data;
  }

  async deletePlanningData(id: string) {
    const response = await this.api.delete(`/planning-book/planning-data/${id}`);
    return response.data;
  }

  // Planning Book - Alerts
  async getAlerts(params?: any) {
    const response = await this.api.get('/planning-book/alerts', { params });
    return response.data;
  }

  async getUnresolvedAlerts(params?: any) {
    const response = await this.api.get('/planning-book/alerts/unresolved', { params });
    return response.data;
  }

  async resolveAlert(id: string) {
    const response = await this.api.post(`/planning-book/alerts/${id}/resolve`);
    return response.data;
  }

  async evaluateAlerts(data: any) {
    const response = await this.api.post('/planning-book/alerts/evaluate', data);
    return response.data;
  }

  // Planning Book - History
  async getHistory(params?: any) {
    const response = await this.api.get('/planning-book/history', { params });
    return response.data;
  }

  async getVersionHistory(versionId: string, params?: any) {
    const response = await this.api.get(`/planning-book/history/${versionId}`, { params });
    return response.data;
  }

  // Generic API call method
  async request<T = any>(method: string, url: string, data?: any, params?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.api.request({
      method,
      url,
      data,
      params,
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;