// src/composables/useDataTransform.ts
import type { QueryResult, DataTransform, FilterRule, AggregationConfig, DerivedColumn } from '@/types';

export function useDataTransform() {
  function applyDerivedColumns(data: QueryResult[], derivedColumns: DerivedColumn[]): QueryResult[] {
    if (derivedColumns.length === 0) return data;
    return data.map(row => {
      const newRow = { ...row };
      for (const dc of derivedColumns) {
        try {
          const fn = new Function('row', `with(row) { return ${dc.expression}; }`);
          newRow[dc.name] = fn(row);
        } catch {
          newRow[dc.name] = null;
        }
      }
      return newRow;
    });
  }

  function applyTransforms(data: QueryResult[], transform: DataTransform, derivedColumns?: DerivedColumn[]): QueryResult[] {
    let result = [...data];
    if (derivedColumns && derivedColumns.length > 0) {
      result = applyDerivedColumns(result, derivedColumns);
    }
    result = applyFilters(result, transform.filters);
    if (transform.aggregation && transform.aggregation.groupBy.length > 0) {
      result = applyAggregation(result, transform.aggregation);
    }
    if (transform.sort) {
      result = applySort(result, transform.sort);
    }
    return result;
  }

  function applyFilters(data: QueryResult[], filters: FilterRule[]): QueryResult[] {
    return data.filter(row =>
      filters.every(rule => {
        const val = row[rule.column];
        switch (rule.operator) {
          case '=': return String(val) === rule.value;
          case '!=': return String(val) !== rule.value;
          case '>': return Number(val) > Number(rule.value);
          case '<': return Number(val) < Number(rule.value);
          case '>=': return Number(val) >= Number(rule.value);
          case '<=': return Number(val) <= Number(rule.value);
          case 'contains': return String(val).toLowerCase().includes(rule.value.toLowerCase());
          case 'not_contains': return !String(val).toLowerCase().includes(rule.value.toLowerCase());
          case 'is_null': return val === null || val === undefined;
          case 'is_not_null': return val !== null && val !== undefined;
          default: return true;
        }
      })
    );
  }

  function applySort(data: QueryResult[], sort: { column: string; direction: 'asc' | 'desc' }): QueryResult[] {
    return [...data].sort((a, b) => {
      const aVal = a[sort.column];
      const bVal = b[sort.column];
      const cmp = typeof aVal === 'number' && typeof bVal === 'number'
        ? aVal - bVal
        : String(aVal ?? '').localeCompare(String(bVal ?? ''));
      return sort.direction === 'asc' ? cmp : -cmp;
    });
  }

  function applyAggregation(data: QueryResult[], agg: AggregationConfig): QueryResult[] {
    const groups = new Map<string, QueryResult[]>();
    for (const row of data) {
      const key = agg.groupBy.map(col => String(row[col])).join('|||');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(row);
    }
    return Array.from(groups.entries()).map(([, rows]) => {
      const result: QueryResult = {};
      for (const col of agg.groupBy) {
        result[col] = rows[0]?.[col];
      }
      for (const { column, type } of agg.aggregations) {
        const values = rows.map(r => Number(r[column])).filter(v => !isNaN(v));
        switch (type) {
          case 'sum': result[column] = values.reduce((a, b) => a + b, 0); break;
          case 'avg': result[column] = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0; break;
          case 'count': result[column] = rows.length; break;
          case 'min': result[column] = values.length ? Math.min(...values) : 0; break;
          case 'max': result[column] = values.length ? Math.max(...values) : 0; break;
          case 'none': result[column] = rows[0]?.[column]; break;
        }
      }
      return result;
    });
  }

  return { applyTransforms, applyDerivedColumns };
}
