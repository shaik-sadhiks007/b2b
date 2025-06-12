import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Pie } from 'react-chartjs-2';
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
                        <h1 className="text-3xl font-bold text-gray-900 mb-8">Item Summary</h1>
                        <p className="text-xl text-gray-900 mb-8">Item Summary of Accepted Orders only</p>
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