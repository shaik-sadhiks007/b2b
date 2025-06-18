import React, { useState, useEffect } from 'react';
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

const Summary = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('1M'); // Default to 1 month

  useEffect(() => {
    const fetchSummaryData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/api/orders/summary?timeFrame=${selectedTimeFrame}`); // Adjust API endpoint as needed
        setSummaryData(response.data);
      } catch (err) {
        console.error('Error fetching summary data:', err);
        setError('Failed to load summary data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, [selectedTimeFrame]);

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const { totalOrdersCount, totalRevenue, totalItemsSold, dailyRevenue, popularItems, recentOrders } = summaryData || {};

  // Prepare data for the Report Line Chart
  const reportChartData = {
    labels: dailyRevenue?.map(data => data._id), // Dates
    datasets: [
      {
        label: 'Daily Revenue',
        data: dailyRevenue?.map(data => data.totalDailyRevenue),
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
      },
    },
  };

  return (
    <div className="container-fluid px-0">
      <div style={{ marginTop: '60px' }}>
        <Navbar />
        <Sidebar />
      </div>
      <div className="col-lg-10 ms-auto" style={{ marginTop: '60px' }}>
        {
          loading ? (
            <div className="p-4 text-center">Loading summary data...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">Error: {error}</div>
          ) : (
            <div className="p-6 bg-gray-100 min-h-screen">
              {/* Welcome Back & Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {/* Welcome Back Card - Placeholder */}
                <div className="bg-white p-6 rounded-lg shadow flex items-center">
                  <img src="https://via.placeholder.com/50" alt="User" className="rounded-full mr-4" />
                  <div>
                    <p className="text-gray-500">Welcome Back</p>
                    <h2 className="text-xl font-semibold">Tommy Style</h2>
                  </div>
                </div>

                {/* Total Sales Card */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <p className="text-gray-500">Total Sales</p>
                  <h2 className="text-2xl font-bold">{formatCurrency(totalRevenue)}</h2>
                  <p className="text-green-500 text-sm">+3.4%</p> {/* Placeholder, integrate real percentage later */}
                </div>

                {/* Total Orders Card */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <p className="text-gray-500">Total Orders</p>
                  <h2 className="text-2xl font-bold">{totalOrdersCount}</h2>
                  <p className="text-green-500 text-sm">+12.8%</p> {/* Placeholder, integrate real percentage later */}
                </div>

                {/* Product View Card (Total Items Sold) */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <p className="text-gray-500">Product View</p>
                  <h2 className="text-2xl font-bold">{totalItemsSold}</h2> {/* Changed from K to raw number, adjust as needed */}
                  <p className="text-red-500 text-sm">-2.4%</p> {/* Placeholder, integrate real percentage later */}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Balance Breakdown (Donut Chart) - Placeholder */}
                <div className="bg-white p-6 rounded-lg shadow lg:col-span-1">
                  <h2 className="text-xl font-semibold mb-4">Balance Breakdown</h2>
                  {/* Doughnut chart will go here */}
                  <div className="flex justify-center items-center h-48">
                    <Doughnut
                      data={{
                        labels: ['Net Profit', 'Expenses', 'Taxes'],
                        datasets: [
                          {
                            data: [32340, 8068, 2560], // Hardcoded for now, will integrate real data
                            backgroundColor: ['#10B981', '#F59E0B', '#EF4444'], // Green, Amber, Red
                            hoverOffset: 4,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                  label += ': ';
                                }
                                if (context.parsed !== null) {
                                  label += `$${context.parsed}`;
                                }
                                return label;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-around mt-4 text-sm">
                    <div className="text-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full inline-block mr-2"></div>
                      <p className="text-gray-600">Net Profit</p>
                      <p className="font-bold">$32,340</p>
                    </div>
                    <div className="text-center">
                      <div className="w-3 h-3 bg-amber-500 rounded-full inline-block mr-2"></div>
                      <p className="text-gray-600">Expenses</p>
                      <p className="font-bold">$8,068</p>
                    </div>
                    <div className="text-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full inline-block mr-2"></div>
                      <p className="text-gray-600">Taxes</p>
                      <p className="font-bold">$2,560</p>
                    </div>
                  </div>
                </div>

                {/* Report Line Chart */}
                <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Report</h2>
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
                    <a href="#" className="text-orange-500 text-sm">See All</a>
                  </div>
                  {
                    recentOrders && recentOrders.length > 0 ? (
                      recentOrders.map((order) => (
                        <div key={order._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center">
                            <img src="https://via.placeholder.com/40" alt="Item" className="rounded-md mr-3" />
                            <span>Order #{order._id.slice(-6)}</span>
                          </div>
                          <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
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
                    <h2 className="text-xl font-semibold">Popular Products</h2>
                    <button className="text-gray-500 flex items-center text-sm"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-filter mr-1"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>Filter</button>
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
                                {/* <img src={item.imageUrl} alt={item.itemName} className="w-8 h-8 rounded-md mr-2" /> */}
                                <span>{item.itemName}</span>
                              </div>
                            </td>
                            <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">{item.totalSold}</td>
                            <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">N/A</td>{/* Category - Placeholder */}
                            <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">N/A</td>{/* Brand - Placeholder */}
                            <td className="px-2 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                In Stock
                              </span>{/* Status - Placeholder */}
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