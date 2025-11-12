/**
 * Planning Book Type Definitions
 */

export interface TimeSetting {
  id: string;
  name: string;
  type: 'fixed' | 'rolling';
  startDate: string;
  endDate?: string;
  rollingPeriods?: number;
  rollingUnit?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  timeHierarchy: {
    day?: boolean;
    week?: boolean;
    month?: boolean;
    quarter?: boolean;
    year?: boolean;
  };
  isActive: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimePeriod {
  period: string;
  type: 'day' | 'week' | 'month' | 'quarter' | 'year';
  label: string;
  date: Date;
}

export interface KeyFigure {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'base' | 'calculated';
  unit?: string;
  formula?: string;
  sourceTable?: string;
  sourceField?: string;
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
  displayFormat?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  formulaDetail?: {
    expression: string;
    dependencies: string[];
    validationRules?: any;
    isValid: boolean;
    errorMessage?: string;
  };
}

export interface PlanningVersion {
  id: string;
  name: string;
  description?: string;
  baseVersionId?: string;
  status: 'draft' | 'active' | 'locked' | 'archived';
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  lockedAt?: string;
  lockedBy?: string;
}

export interface PlanningData {
  id: string;
  versionId: string;
  keyFigureId: string;
  timePeriod: string;
  periodType: 'day' | 'week' | 'month' | 'quarter' | 'year';
  value: number;
  unit?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlanningGridRow {
  keyFigureId: string;
  keyFigureCode: string;
  keyFigureName: string;
  keyFigureType: 'base' | 'calculated';
  unit?: string;
  values: PlanningGridCell[];
}

export interface PlanningGridCell {
  period: string;
  type: 'day' | 'week' | 'month' | 'quarter' | 'year';
  value: number;
  unit?: string;
  notes?: string;
  dataId?: string;
}

export interface PlanningGrid {
  columns: TimePeriod[];
  rows: PlanningGridRow[];
}

export interface Alert {
  id: string;
  versionId: string;
  keyFigureId: string;
  timePeriod: string;
  alertType: 'shortage' | 'excess' | 'exception' | 'threshold';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  thresholdValue?: number;
  actualValue?: number;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt?: string;
}

export interface HistoryEntry {
  id: number;
  versionId: string;
  keyFigureId?: string;
  timePeriod?: string;
  action: 'create' | 'update' | 'delete' | 'copy' | 'lock' | 'unlock';
  oldValue?: number;
  newValue?: number;
  changedBy: string;
  changedAt: string;
  ipAddress?: string;
  userAgent?: string;
  notes?: string;
}



