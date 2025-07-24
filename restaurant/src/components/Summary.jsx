import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement // For Doughnut chart
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { API_URL } from '../api/api';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { AuthContext } from '../context/AuthContext';
import { Link, useParams } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Summary = ({ adminMode = false }) => {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('1M'); // Default to 1 month
  const [showTooltip, setShowTooltip] = useState(false);
  const [showPopularItemsHelp, setShowPopularItemsHelp] = useState(false);

  const { user } = useContext(AuthContext);
  const { ownerId } = useParams();

  useEffect(() => {
    const fetchSummaryData = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `${API_URL}/api/orders/summary?timeFrame=${selectedTimeFrame}`;
        let params = {};
        if (adminMode && ownerId) {
          url = `${API_URL}/api/orders/admin/summary`;
          params.ownerId = ownerId;
          params.timeFrame = selectedTimeFrame;
        }
        const response = await axios.get(url, { params });
        setSummaryData(response.data);
      } catch (err) {
        console.error('Error fetching summary data:', err);
        setError('Failed to load summary data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, [selectedTimeFrame, adminMode, ownerId]);

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const { totalOrdersCount, totalRevenue, totalItemsSold, dailyRevenue, popularItems, recentOrders } = summaryData || {};

  // Calculate balance breakdown from actual revenue data
  const calculateBalanceBreakdown = () => {
    const revenue = totalRevenue || 0;
    // Estimate expenses as 25% of revenue (typical restaurant expenses)
    const expenses = revenue * 0.25;
    // Estimate taxes as 5% of revenue (GST)
    const taxes = revenue * 0.05;
    // Net profit is revenue minus expenses and taxes
    const netProfit = revenue - expenses - taxes;

    return {
      netProfit: Math.max(0, netProfit), // Ensure non-negative
      expenses: Math.max(0, expenses),
      taxes: Math.max(0, taxes)
    };
  };

  const balanceData = calculateBalanceBreakdown();

  // Prepare data for the Report Line Chart
  const reportChartData = {
    labels: dailyRevenue?.map(data => {
      // Format date for display
      const date = new Date(data._id);
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric'
      });
    }) || [],
    datasets: [
      {
        label: 'Daily Revenue',
        data: dailyRevenue?.map(data => data.totalDailyRevenue) || [],
        fill: false,
        borderColor: 'rgb(255, 159, 64)', // Orange color from the image
        tension: 0.4,
      },
    ],
  };

  const reportChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // No legend for this chart as per image
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function (context) {
            return `Revenue: ${formatCurrency(context.parsed.y)}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          minRotation: 0,
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          borderDash: [8, 4], // Dashed grid lines
        },
        ticks: {
          callback: function (value) {
            return formatCurrency(value);
          }
        }
      },
    },
  };

  // Prepare data for the Balance Breakdown Doughnut Chart
  const doughnutChartData = {
    labels: ['Net Profit', 'Expenses', 'Taxes'],
    datasets: [
      {
        data: [balanceData.netProfit, balanceData.expenses, balanceData.taxes],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'], // Green, Amber, Red
        hoverOffset: 4,
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += formatCurrency(context.parsed);
            }
            return label;
          }
        }
      }
    }
  };

  return (
    <div className="container-fluid px-0">
      {
        (user && user?.role !== 'admin') && (
          <div style={{ marginTop: "60px" }}>
            <Navbar />
            <Sidebar />
          </div>
        )
      }

      <div
        className={`${user?.role === 'admin' ? 'col-lg-12' : 'col-lg-10'} ms-auto`}
        style={{ marginTop: user?.role === 'admin' ? '0px' : '60px' }}
      >
        {
          loading ? (
            <div className="p-4 text-center">Loading summary data...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">Error: {error}</div>
          ) : (
            <div className="p-6 bg-gray-100 min-h-screen">
              {/* Welcome Back & Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {/* Welcome Back Card */}
                <div className="bg-white p-6 rounded-lg shadow flex items-center">
                  <div>
                    <p className="text-gray-500">Welcome Back</p>
                    <h2 className="text-xl font-semibold capitalize">{user?.username || 'User'}</h2>
                  </div>
                </div>

                {/* Total Sales Card */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <p className="text-gray-500">Total Sales</p>
                  <h2 className="text-2xl font-bold">{formatCurrency(totalRevenue)}</h2>
                  {/* <p className="text-green-500 text-sm">+3.4%</p>  */}
                </div>

                {/* Total Orders Card */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <p className="text-gray-500">Total Orders</p>
                  <h2 className="text-2xl font-bold">{totalOrdersCount || 0}</h2>
                  {/* <p className="text-green-500 text-sm">+12.8%</p>  */}
                </div>

                {/* Product View Card (Total Items Sold) */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <p className="text-gray-500">Product View</p>
                  <h2 className="text-2xl font-bold">{totalItemsSold || 0}</h2>
                  {/* <p className="text-red-500 text-sm">-2.4%</p> */}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 mb-6">
                {/* Report Line Chart - now full width */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <h2 className="text-xl font-semibold">Report</h2>
                      <div className="relative ml-2">
                        <button
                          onClick={() => setShowTooltip(!showTooltip)}
                          className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-help-circle">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                            <line x1="12" x2="12.01" y1="17" y2="17" />
                          </svg>
                        </button>
                        {showTooltip && (
                          <div className="absolute z-10 w-64 p-2 mt-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg">
                            <p>This graph shows revenue data for different time periods:</p>
                            <ul className="list-disc pl-5 mt-1">
                              <li>1D: 1 Day</li>
                              <li>1W: 1 Week</li>
                              <li>1M: 1 Month</li>
                              <li>3M: 3 Months</li>
                              <li>6M: 6 Months</li>
                            </ul>
                            <p className="mt-1">Click on the buttons to switch between time frames.</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-x-2">
                      {['1D', '1W', '1M', '3M', '6M'].map((frame) => (
                        <button
                          key={frame}
                          className={`px-3 py-1 rounded-md text-sm ${selectedTimeFrame === frame ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                          onClick={() => setSelectedTimeFrame(frame)}
                        >
                          {frame}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-80">
                    <Line data={reportChartData} options={reportChartOptions} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Recent Orders</h2>
                    <Link to='/orders' className="text-orange-500 text-sm">See All</Link>
                  </div>
                  {
                    recentOrders && recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                        <div key={order._id} className="py-2 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center mb-2">
                            <span className="font-semibold mr-2">Order #{order._id.slice(-6)}</span>
                            <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 items-center mb-2">
                            {order.items && order.items.length > 0 ? (
                              order.items.map((item, idx) => (
                                <div key={item._id || idx} className="flex items-center gap-2 bg-gray-50 rounded p-1">
                                  {item.photos && item.photos.length > 0 ? (
                                    <img
                                      src={item.photos[0]}
                                      alt={item.name}
                                      className="w-10 h-10 object-cover rounded"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 flex items-center justify-center bg-gray-300 rounded">
                                      <span className="text-white text-xs font-bold text-center px-2">{item.name}</span>
                                    </div>
                                  )}
                                  <span className="text-gray-700 text-sm">{item.name} x{item.quantity}</span>
                                </div>
                              ))
                            ) : null}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
                            <span className="text-xs text-gray-500">{order.status.replace(/_/g, ' ')}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center">No recent orders.</p>
                    )
                  }
                </div>

                {/* Popular Products */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <h2 className="text-xl font-semibold">Popular Products</h2>
                      <div className="relative ml-2">
                        <button
                          onClick={() => setShowPopularItemsHelp(!showPopularItemsHelp)}
                          className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          <HelpCircle className="w-5 h-5" />
                        </button>
                        {showPopularItemsHelp && (
                          <div className="absolute z-10 w-64 p-2 mt-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg">
                            <p>Most ordered items are listed here based on the selected time period.</p>
                            <p className="mt-1">The table shows the item name, quantity sold, and other details.</p>
                            <button
                              type="button"
                              className="absolute top-1 right-1 text-gray-500 hover:text-gray-700"
                              onClick={() => setShowPopularItemsHelp(false)}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <button className="text-gray-500 flex items-center text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-filter mr-1">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                      </svg>
                      Filter
                    </button>
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Sold</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {popularItems && popularItems.length > 0 ? (
                        popularItems.map((item, index) => (
                          <tr key={index}>
                            <td className="px-2 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span>{item.itemName}</span>
                              </div>
                            </td>
                            <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">{item.totalSold}</td>
                            <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">N/A</td>
                            <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">N/A</td>
                            <td className="px-2 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                In Stock
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-2 py-4 whitespace-nowrap text-center text-gray-500">No popular items.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
};

export default Summary;