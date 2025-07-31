import React from 'react';
import { Filter, Clock, Building } from 'lucide-react';

const OrderFilters = ({
  timeFilter,
  businessFilter,
  businessNames = [],
  businessNamesLoading = false,
  onTimeFilterChange,
  onBusinessFilterChange,
  onClearFilters
}) => {
  const timeOptions = [
    { value: '', label: 'All Time' },
    { value: '1h', label: 'Last 1 Hour' },
    { value: '3h', label: 'Last 3 Hours' },
    { value: '6h', label: 'Last 6 Hours' },
    { value: '12h', label: 'Last 12 Hours' },
    { value: '24h', label: 'Last 24 Hours' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Time Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Clock className="w-4 h-4" />
            Time Range
          </label>
          <select
            value={timeFilter}
            onChange={(e) => onTimeFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {timeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Business Filter */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Building className="w-4 h-4" />
            Business
          </label>
          <select
            value={businessFilter}
            onChange={(e) => onBusinessFilterChange(e.target.value)}
            disabled={businessNamesLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">All Businesses</option>
            {businessNamesLoading ? (
              <option value="" disabled>Loading businesses...</option>
            ) : (
              businessNames.map(businessName => (
                <option key={businessName} value={businessName}>
                  {businessName}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          <button
            onClick={onClearFilters}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderFilters; 