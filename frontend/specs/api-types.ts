/**
 * Types for JSON responses returned by the dashboard feature endpoints.
 * These describe the observed OpenAPI contract; they do not validate payloads
 * at runtime or implement API requests.
 */

import type {
  BusinessType,
  Category,
  ISODate,
  OperationType,
} from "./types";

/** Response from GET /api/metrics/facets. */
export interface FacetsResponse {
  /**
   * Operation values available as filters; each item is `income` or `outcome`.
   */
  operation_types: OperationType[];

  /**
   * Business segments available as filters; each item is `B2B` or `B2C`.
   */
  business_types: BusinessType[];

  /**
   * Category values available as filters; values follow the API `Category` union.
   */
  categories: Category[];

  /**
   * Earliest movement date in the available data, serialized as `YYYY-MM-DD`.
   */
  min_date: ISODate;

  /**
   * Latest movement date in the available data, serialized as `YYYY-MM-DD`.
   */
  max_date: ISODate;
}

/** One anomaly bucket returned by GET /api/metrics/alerts. */
export interface AlertEntry {
  /**
   * Server-generated label for the bucket; its exact format depends on `group_by`
   * (`day`, `week`, or `month`) and is represented as a string by OpenAPI.
   */
  period: string;

  /** Total outcome amount for this bucket, expressed as a JSON number. */
  outcome_total: number;

  /**
   * Historical baseline average for this bucket, expressed as a JSON number.
   */
  baseline_average: number;

  /**
   * Increase over the baseline as a fractional ratio (for example, `0.3` means
   * 30%); this is not a percentage value from 0 to 100.
   */
  increase_ratio: number;
}

/** The alerts endpoint returns a bare JSON array, not an object wrapper. */
export type AlertsResponse = AlertEntry[];

/** One category total returned by GET /api/metrics/categories/top. */
export interface CategoryEntry {
  /** Category identifier; allowed values follow the API `Category` union. */
  category: Category;

  /** Operation associated with the total; `income` or `outcome`. */
  operation_type: OperationType;

  /** Sum for this category and operation, expressed as a JSON number. */
  total_amount: number;
}

/** The top-categories endpoint returns a bare JSON array, not an object wrapper. */
export type TopCategoriesResponse = CategoryEntry[];
