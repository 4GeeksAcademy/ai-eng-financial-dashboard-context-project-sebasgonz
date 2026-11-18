/**
 * TypeScript contract and view-model definitions for the frontend feature specs.
 *
 * This file documents shapes only. It is not imported by the application and
 * does not implement API calls, validation, mapping, or UI behavior.
 */

/** Calendar date serialized as YYYY-MM-DD. Validate values at runtime. */
export type ISODate = string;

export type OperationType = "income" | "outcome";
export type Category =
  | "suppliers"
  | "sales"
  | "operational"
  | "administrative"
  | "others";
export type BusinessType = "B2B" | "B2C";
export type MetricsGroupBy = "day" | "week" | "month";

/** Existing GET /api/metrics movement payload. */
export interface FinancialMovement {
  create_date: ISODate;
  amount: number;
  operation_type: OperationType;
  category: Category;
  business_type: BusinessType;
}

/** Existing GET /api/metrics/facets response. */
export interface MetricsFacets {
  operation_types: OperationType[];
  business_types: BusinessType[];
  categories: Category[];
  min_date: ISODate;
  max_date: ISODate;
}

/** Existing optional date query parameters used by metrics endpoints. */
export interface DateRangeQuery {
  start_date?: ISODate;
  end_date?: ISODate;
}

/** UI filter state; omit either bound when it is unset. */
export interface DateRangeFilter {
  startDate?: ISODate;
  endDate?: ISODate;
}

/** Existing GET /api/metrics/alerts query parameters and backend limits. */
export interface MetricsAlertsQuery extends DateRangeQuery {
  threshold?: number;
  group_by?: MetricsGroupBy;
  business_type?: BusinessType;
}

/** Existing GET /api/metrics/alerts response item. Ratios are fractions. */
export interface MetricsAlert {
  period: string;
  outcome_total: number;
  baseline_average: number;
  increase_ratio: number;
}

/** UI control specification; stricter than the current API's threshold >= 0. */
export interface AnomalyThresholdControl {
  value: number;
  min: 0.01;
  max: 1.0;
  step?: number;
}

/** Existing GET /api/metrics/categories/top query parameters. */
export interface TopCategoriesQuery extends DateRangeQuery {
  operation_type: OperationType;
  limit: number;
  business_type: BusinessType;
}

/** Existing GET /api/metrics/categories/top response item. */
export interface TopCategoryItem {
  category: Category;
  operation_type: OperationType;
  total_amount: number;
}

/** Derived presentation row; percentage is not returned by the API. */
export interface TopIncomeCategoryRow {
  category: Category;
  totalAmount: number;
  percentageOfGroupIncome: number;
}

/** Derived comparison section; totalIncome uses all group income movements. */
export interface BusinessIncomeSummary {
  businessType: BusinessType;
  totalIncome: number;
  topCategories: TopIncomeCategoryRow[];
}

/** Derived single-chart datum for comparing the two group totals. */
export interface BusinessIncomeChartDatum {
  businessType: BusinessType;
  totalIncome: number;
}

/** Existing GET /api/metrics/comparison response; not the B2B/B2C view model. */
export interface MetricsComparison {
  current_period: number;
  previous_period: number;
  delta_abs: number;
  delta_pct: number | null;
}
