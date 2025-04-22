'use client';

interface Column {
  key: string;
  header: string;
  format?: 'percent' | 'currency' | 'decimal' | 'percentDiff' | 'integer' | 'industryComparison';
  comparisonKeys?: {
    valueKey: string;
    benchmarkKey: string;
  };
}

// Define a type for table cell values
type CellValue = string | number | boolean | null | undefined;

// Generic interface to accept both Record types and specific types like Audience/Channel
interface PerformanceTableProps<T> {
  data: T[];
  columns: Column[];
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PerformanceTable = <T extends Record<string, any>>({
  data,
  columns,
  limit,
  sortBy = columns?.[0]?.key,
  sortDirection = 'desc'
}: PerformanceTableProps<T>) => {
  // Format cell value based on column format
  const formatValue = (value: CellValue, format?: string, row?: T, column?: Column): string => {
    if (value === undefined || value === null) return '-';
    
    switch (format) {
      case 'percent':
        return typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : '-';
      case 'currency':
        return typeof value === 'number' ? `$${value.toFixed(2)}` : '-';
      case 'decimal':
        return typeof value === 'number' ? `${value.toFixed(1)}` : '-';
      case 'percentDiff':
        return typeof value === 'number' 
          ? (value >= 0 ? `+${(value * 100).toFixed(1)}%` : `${(value * 100).toFixed(1)}%`)
          : '-';
      case 'integer':
        return typeof value === 'number' ? value.toLocaleString() : '-';
      case 'industryComparison':
        if (!row || !column?.comparisonKeys) return '-';
        
        const { valueKey, benchmarkKey } = column.comparisonKeys;
        const actualValue = getNestedValue(row, valueKey);
        const benchmarkValue = getNestedValue(row, benchmarkKey);
        


        if (typeof actualValue === 'number' && typeof benchmarkValue === 'number' && benchmarkValue !== 0) {
          const percentDiff = ((actualValue - benchmarkValue) / benchmarkValue) * 100;
          return percentDiff >= 0 ? `+${percentDiff.toFixed(1)}%` : `${percentDiff.toFixed(1)}%`;
        }
        return '-';
      default:
        return value?.toString() || '-';
    }
  };

  // Sort and limit data
  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortBy as string];
    const bValue = b[sortBy as string];
    
    // Handle null/undefined values in sorting
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
    if (bValue == null) return sortDirection === 'asc' ? 1 : -1;
    
    // Compare values based on sort direction
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // String comparison for non-numeric values
    const aStr = String(aValue);
    const bStr = String(bValue);
    return sortDirection === 'asc'
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });

  const limitedData = limit ? sortedData.slice(0, limit) : sortedData;

  // Get style for percentDiff and industryComparison values
  const getValueStyle = (value: CellValue, format?: string, row?: T, column?: Column): string => {
    if (format === 'percentDiff' && typeof value === 'number') {
      return value >= 0 ? 'text-green-500' : 'text-red-500';
    }
    
    if (format === 'industryComparison' && column?.comparisonKeys) {
      const { valueKey, benchmarkKey } = column.comparisonKeys;
      const actualValue = getNestedValue(row, valueKey);
      const benchmarkValue = getNestedValue(row, benchmarkKey);
      
      if (typeof actualValue === 'number' && typeof benchmarkValue === 'number' && benchmarkValue !== 0) {
        // For acquisition cost, lower is better, so we invert the color logic
        if (valueKey.includes('acquisition_cost')) {
          return actualValue < benchmarkValue ? 'text-green-500' : 'text-red-500';
        }
        // For all other metrics (conversion rate, ROI, CTR), higher is better
        return actualValue > benchmarkValue ? 'text-green-500' : 'text-red-500';
      }
    }
    
    return '';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            {columns.map((column) => (
              <th 
                key={column.key}
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {limitedData.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {columns.map((column) => (
                <td 
                  key={`${rowIndex}-${column.key}`} 
                  className={`px-4 py-3 whitespace-nowrap text-sm ${getValueStyle(row[column.key], column.format, row, column)}`}
                >
                  {column.format === 'industryComparison' && column.comparisonKeys 
                    ? renderIndustryComparison(row, column.comparisonKeys)
                    : formatValue(row[column.key], column.format, row, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Helper function to get nested property values
const getNestedValue = <T extends Record<string, any>>(obj: T | undefined, path: string): any => {
  if (!obj) return undefined;
  
  try {
    // Handle the case where the object might be stringified JSON
    const processedObj = typeof obj === 'string' ? JSON.parse(obj) : obj;
    
    return path.split('.').reduce((prev, curr) => {
      if (prev === null || prev === undefined) return undefined;
      return prev[curr];
    }, processedObj as Record<string, any>);
  } catch (error) {
    return undefined;
  }
};

// Function to render industry comparison values
const renderIndustryComparison = <T extends Record<string, any>>(
  row: T, 
  comparisonKeys: { valueKey: string; benchmarkKey: string }
): React.ReactNode => {
  const { valueKey, benchmarkKey } = comparisonKeys;
  const actualValue = getNestedValue(row, valueKey);
  const benchmarkValue = getNestedValue(row, benchmarkKey);
  

  if (typeof actualValue === 'number' && typeof benchmarkValue === 'number' && benchmarkValue !== 0) {
    const percentDiff = ((actualValue - benchmarkValue) / benchmarkValue) * 100;
    const formattedValue = percentDiff >= 0 ? `+${percentDiff.toFixed(1)}%` : `${percentDiff.toFixed(1)}%`;
    const colorClass = percentDiff >= 0 ? 'text-green-500' : 'text-red-500';
    
    return <span className={colorClass}>{formattedValue}</span>;
  }
  
  return '-';
};

export default PerformanceTable;
