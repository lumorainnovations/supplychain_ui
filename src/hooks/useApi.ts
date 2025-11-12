import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T = any>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
    } catch (error: any) {
      setState({
        data: null,
        loading: false,
        error: error.response?.data?.error || error.message || 'An error occurred',
      });
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, refetch: execute };
}

export function useDashboardSummary() {
  return useApi(() => apiService.getDashboardSummary());
}

export function useInventory(params?: any) {
  return useApi(() => apiService.getInventory(params), [params]);
}

export function useUsers(params?: any) {
  return useApi(() => apiService.getUsers(params), [params]);
}

export function useProductionOrders(params?: any) {
  return useApi(() => apiService.getProductionOrders(params), [params]);
}

export function useBOMs(params?: any) {
  return useApi(() => apiService.getBOMs(params), [params]);
}

export function useSuppliers(params?: any) {
  return useApi(() => apiService.getSuppliers(params), [params]);
}

export function useDistributionRoutes(params?: any) {
  return useApi(() => apiService.getDistributionRoutes(params), [params]);
}

export function useCapacityResources(params?: any) {
  return useApi(() => apiService.getCapacityResources(params), [params]);
}

export function useDemandForecasts(params?: any) {
  return useApi(() => apiService.getDemandForecasts(params), [params]);
}

export function useLowStockItems() {
  return useApi(() => apiService.getLowStockItems());
}

export function useChartData(type: string) {
  return useApi(() => apiService.getChartData(type), [type]);
}

// Mutation hooks for CRUD operations
export function useApiMutation<T = any>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(async (apiCall: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
      throw error;
    }
  }, []);

  return { ...state, mutate };
}