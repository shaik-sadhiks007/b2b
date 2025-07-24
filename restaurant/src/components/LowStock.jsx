import React, { useContext, useState, useEffect } from 'react';
import { MenuContext } from '../context/MenuContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { 
  RefreshCw, 
  Filter, 
  ChevronUp, 
  ChevronDown, 
  AlertTriangle,
  Printer,
  Download
} from 'lucide-react';
import { toast } from 'react-toastify';

const LowStock = () => {
  const { getLowStockItems, lowStockThreshold, setLowStockThreshold } = useContext(MenuContext);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'quantity', direction: 'asc' });
  const [threshold, setThreshold] = useState(lowStockThreshold);
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    refreshLowStockItems();
  }, []);

  const refreshLowStockItems = () => {
    setLoading(true);
    try {
      const items = getLowStockItems(threshold);
      setLowStockItems(items);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load low stock items');
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedItems = React.useMemo(() => {
    let sortableItems = [...lowStockItems];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [lowStockItems, sortConfig]);

  const categories = [...new Set(lowStockItems.map(item => item.category))];

  const filteredItems = sortedItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const handleThresholdChange = (e) => {
    e.preventDefault();
    if (threshold !== lowStockThreshold) {
      setLowStockThreshold(threshold);
      refreshLowStockItems();
    }
  };

  const getSeverity = (quantity) => {
    if (quantity <= 5) return 'critical';
    if (quantity <= 10) return 'warning';
    return 'low';
  };

  const severityColors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-orange-100 text-orange-800 border-orange-200',
    low: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Category', 'Subcategory', 'Quantity'];
    const csvContent = [
      headers.join(','),
      ...filteredItems.map(item => [
        `"${item.name}"`,
        `"${item.category}"`,
        `"${item.subcategory}"`,
        item.quantity
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'low-stock-items.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col md:flex-row mt-6">
      <Sidebar />
      <div className="flex flex-col w-full">
        <Navbar />

        <div className="w-full px-4 md:px-6 py-4 flex justify-center">
          <div className="w-full max-w-6xl">
            {/* Header */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-4 md:p-6 pb-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div className="flex items-center gap-1">
                  <AlertTriangle className="text-orange-500 h-6 w-6" />
                  <h1 className="text-xl font-bold">Low Stock Items</h1>
                  <span className="px-2 py-1 text-xs font-medium border border-orange-200 text-orange-500 rounded-full">
                    {filteredItems.length} items
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => window.print()} className="flex items-center gap-1 px-3 py-2 text-sm font-medium border rounded-md hover:bg-gray-50">
                    <Printer className="h-4 w-4" /> Print
                  </button>
                  <button onClick={exportToCSV} className="flex items-center gap-1 px-3 py-2 text-sm font-medium border rounded-md hover:bg-gray-50">
                    <Download className="h-4 w-4" /> Export
                  </button>
                  <button onClick={refreshLowStockItems} className="flex items-center gap-1 px-3 py-2 text-sm font-medium border rounded-md hover:bg-gray-50">
                    <RefreshCw className="h-4 w-4" /> Refresh
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="p-4 md:p-6 pt-4 grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="md:col-span-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Filter className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <form onSubmit={handleThresholdChange} className="flex gap-1">
                  <input
                    type="number"
                    min="1"
                    placeholder="Set Threshold"
                    value={threshold}
                    onChange={(e) => setThreshold(parseInt(e.target.value) )}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                    Apply
                  </button>
                </form>
              </div>
            </div>

            {/* Results Table */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <RefreshCw className="animate-spin h-8 w-8 text-gray-500" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-12 text-center">
                  <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-500">
                    {searchTerm || filterCategory !== 'all'
                      ? 'No matching low stock items found'
                      : 'No items below current threshold'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th onClick={() => handleSort('name')} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                          <div className="flex items-center gap-1">
                            Item Name
                            {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                          </div>
                        </th>
                        <th onClick={() => handleSort('category')} className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                          <div className="flex items-center gap-1">
                            Category
                            {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                          </div>
                        </th>
                        <th onClick={() => handleSort('subcategory')} className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                          <div className="flex items-center gap-1">
                            Subcategory
                            {sortConfig.key === 'subcategory' && (sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                          </div>
                        </th>
                        <th onClick={() => handleSort('quantity')} className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                          <div className="flex items-center justify-end gap-1">
                            Quantity
                            {sortConfig.key === 'quantity' && (sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredItems.map((item) => {
                        const severity = getSeverity(item.quantity);
                        return (
                          <tr key={item._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              {item.description && (
                                <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                              )}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                            <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-500">{item.subcategory}</td>
                            <td className="px-2 py-1 whitespace-nowrap text-right">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${severityColors[severity]}`}>
                                {item.quantity}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LowStock;
