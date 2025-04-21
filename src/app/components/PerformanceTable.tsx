'use client';

interface Column {
  key: string;
  header: string;
  format?: 'percent' | 'currency' | 'multiplier' | 'percentDiff' | 'number';
}

interface PerformanceTableProps {
  data: any[];
  columns: Column[];
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

const PerformanceTable: React.FC<PerformanceTableProps> = ({
  data,
  columns,
  limit,
  sortBy = columns?.[0]?.key,
  sortDirection = 'desc'
}) => {
  // Format cell value based on column format
  const formatValue = (value: any, format?: string) => {
    if (value === undefined || value === null) return '-';
    
    switch (format) {
      case 'percent':
        return `${(value * 100).toFixed(1)}%`;
      case 'currency':
        return `$${value.toFixed(2)}`;
      case 'multiplier':
        return `${value.toFixed(1)}x`;
      case 'percentDiff':
        return value >= 0 
          ? `+${(value * 100).toFixed(1)}%` 
          : `${(value * 100).toFixed(1)}%`;
      case 'number':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  // Sort and limit data
  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    return sortDirection === 'asc' 
      ? (aValue > bValue ? 1 : -1)
      : (aValue < bValue ? 1 : -1);
  });

  const limitedData = limit ? sortedData.slice(0, limit) : sortedData;

  // Get style for percentDiff values
  const getValueStyle = (value: any, format?: string) => {
    if (format === 'percentDiff') {
      return value >= 0 ? 'text-green-500' : 'text-red-500';
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
                  className={`px-4 py-3 whitespace-nowrap text-sm ${getValueStyle(row[column.key], column.format)}`}
                >
                  {formatValue(row[column.key], column.format)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PerformanceTable;