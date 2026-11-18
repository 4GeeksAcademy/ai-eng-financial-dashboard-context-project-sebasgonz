/**
 * Query-parameter types for the dashboard feature endpoints.
 * Property names intentionally retain the API's `snake_case` transport keys.
 */

import type {
  BusinessType,
  ISODate,
  MetricsGroupBy,
  OperationType,
} from "./types";

/** Optional date bounds shared by the alerts and top-categories endpoints. */
export interface DateRangeFilter {
  /**
    * Optional nullable lower calendar-date bound, serialized as `YYYY-MM-DD`;
    * omit when no lower bound is selected. OpenAPI does not declare an ordering
    * constraint relative to `end_date`.
   */
    start_date?: ISODate | null;

  /**
    * Optional nullable upper calendar-date bound, serialized as `YYYY-MM-DD`;
    * omit when no upper bound is selected. OpenAPI does not declare an ordering
    * constraint relative to `start_date`.
   */
    end_date?: ISODate | null;
}

/** Query parameters accepted by GET /api/metrics/alerts. */
export interface AlertsParams extends DateRangeFilter {
  /**
   * Minimum increase ratio for an alert. Must be a number greater than or equal
   * to `0`; there is no maximum in OpenAPI. The API default is `0.3` (30% as a
   * fractional ratio). The proposed UI control range `0.01`–`1.0` is stricter
   * than the current API contract.
   */
  threshold?: number;

  /**
   * Time bucket for alert grouping: `day`, `week`, or `month`. API default:
   * `month`.
   */
  group_by?: MetricsGroupBy;

  /**
  * Optional nullable segment filter: `B2B` or `B2C`; omission includes both
  * segments.
   */
  business_type?: BusinessType | null;
}

/** Query parameters accepted by GET /api/metrics/categories/top. */
export interface TopCategoriesParams extends DateRangeFilter {
  /**
   * Operation to aggregate: `income` or `outcome`. API default: `outcome`.
   */
  operation_type?: OperationType;

  /**
   * Maximum number of category entries to return; integer from `1` through
   * `20`, inclusive. API default: `5`.
   */
  limit?: number;

  /**
  * Optional nullable segment filter: `B2B` or `B2C`; omission includes both
  * segments.
   */
  business_type?: BusinessType | null;
}
