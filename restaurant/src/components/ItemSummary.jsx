import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Pie } from 'react-chartjs-2';
import { HelpCircle } from 'lucide-react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../api/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const ItemSummary = () => {
    const { user } = useContext(AuthContext);
    const [itemSummary, setItemSummary] = useState([]);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [totalItemsToPack, setTotalItemsToPack] = useState(0);
    const [showSummaryHelp, setShowSummaryHelp] = useState(false);

    // Fetch item summary for pie chart
    const fetchItemSummary = async () => {
        setLoadingSummary(true);
        try {
            const response = await axios.get(`${API_URL}/api/orders/accepted-items-summary`);
            setItemSummary(response.data.itemDetails);
            setTotalItemsToPack(response.data.totalItems);
        } catch (err) {
            setItemSummary([]);
            setTotalItemsToPack(0);
            toast.error('Failed to fetch item summary.');
        } finally {
            setLoadingSummary(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchItemSummary();
        }
    }, [user]);

    if (!user) {
        return <div>Please login to access the item summary</div>;
    }

    return (
        <div className="container-fluid px-0">
            <div style={{ marginTop: '60px' }}>
                <Navbar />
                <Sidebar />
            </div>

            <div className="col-lg-10 ms-auto" style={{ marginTop: '60px' }}>
                <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-2 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">Summary</h1>
                            <button 
                                type="button" 
                                className="text-gray-400 hover:text-gray-600"
                                onClick={() => setShowSummaryHelp(!showSummaryHelp)}
                                aria-label="Summary help"
                            >
                                <HelpCircle className="w-5 h-5" />
                            </button>
                            {showSummaryHelp && (
                                <div className="absolute z-10 mt-10 ml-[-8px] bg-white p-3 rounded-lg shadow-lg border border-gray-200 max-w-xs">
                                    <p className="text-sm text-gray-700">
                                        This summary displays the breakdown of items from accepted orders that need to be packed. The pie chart shows the distribution of different items and their quantities.
                                    </p>
                                    <button 
                                        type="button"
                                        className="absolute top-1 right-1 text-gray-500 hover:text-gray-700"
                                        onClick={() => setShowSummaryHelp(false)}
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                        <p className="text-xl text-gray-900 mb-8">Summary of Accepted Orders only</p>
                        {loadingSummary ? (
                            <div className="text-center py-5">Loading summary...</div>
                        ) : itemSummary.length === 0 ? (
                            <div className="text-center py-5">No items to pack.</div>
                        ) : (
                            <div className="d-flex justify-content-center flex-column align-items-center">
                                <h5 className="mb-4">Total Items to pack : {totalItemsToPack}</h5>
                                <div style={{ maxWidth: '500px', width: '100%' }}>
                                    <Pie
                                        data={{
                                            labels: itemSummary.map(i => `${i.name} (${i.quantity})`),
                                            datasets: [
                                                {
                                                    data: itemSummary.map(i => i.quantity),
                                                    backgroundColor: [
                                                        '#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#B2DFDB', '#F06292', '#FFD54F'
                                                    ],
                                                    borderWidth: 1
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                legend: {
                                                    position: 'right',
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemSummary;