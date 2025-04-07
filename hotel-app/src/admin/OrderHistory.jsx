import { useContext, useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { HotelContext } from "../contextApi/HotelContextProvider";
import Navbar from "../components/Navbar";
import moment from "moment";
import { toast } from 'react-toastify';

function OrderHistory() {
    const { user } = useContext(HotelContext);
    const token = localStorage.getItem("token");

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [phone, setPhone] = useState("");
    const [searchName, setSearchName] = useState("");
    const [searchDate, setSearchDate] = useState("");

    useEffect(() => {
        if (!token || !user || !user.role) return;

        const url = user.role === "user"
            ? "http://localhost:5000/api/orders/order-history/user"
            : "http://localhost:5000/api/orders/order-history";

        setLoading(true);
        axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setOrders(response.data);
                setLoading(false);
            })
            .catch(err => {
                toast.error("Failed to fetch orders");
                setLoading(false);
            });
    }, [user, token]);

    const handleSearchByPhone = () => {
        if (!phone.trim()) {
            toast.warning("Please enter a valid phone number");
            return;
        }

        setLoading(true);
        axios.get(`http://localhost:5000/api/orders/phone/${phone}`)
            .then(response => {
                setOrders(response.data);
                setError(null);
                setLoading(false);
            })
            .catch(err => {
                toast.error(err.response?.data?.error || "Failed to fetch orders");
                setLoading(false);
            });
    };

    const handleStatusChange = (orderId, newStatus) => {
        axios.patch(`http://localhost:5000/api/orders/${orderId}`, { status: newStatus }, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(() => {
                setOrders(prevOrders => prevOrders.map(order =>
                    order._id === orderId ? { ...order, status: newStatus } : order
                ));
                toast.success(`Order status updated to ${newStatus}`);
            })
            .catch(err => {
                console.error("Failed to update status", err);
                toast.error("Failed to update order status");
            });
    };

    const handleResendEmail = async (order) => {
        try {
            const response = await axios.post(
                `http://localhost:5000/api/orders/resend-email/${order._id}`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            toast.success('Email sent successfully!');
        } catch (error) {
            console.error('Error sending email:', error);
            toast.error('Failed to send email. Please try again.');
        }
    };

    const filteredOrders = orders.filter(order => {
        // Name filter
        const nameMatch = !searchName || 
            order.shippingDetails?.name?.toLowerCase().includes(searchName.toLowerCase());
        
        // Date filter
        const dateMatch = !searchDate || 
            (searchDate === "today" ? 
                moment(order.createdAt).isSame(moment(), 'day') :
                moment(order.createdAt).format("YYYY-MM-DD") === searchDate);
        
        // Return true if either filter is empty or both match
        return nameMatch && dateMatch;
    });

    const columns = [
        {
            name: "Date",
            selector: row => moment(row.createdAt).format("MMM DD, YYYY"),
            sortable: true
        },
        {
            name: "Name",
            selector: row => row.shippingDetails?.name || 'N/A',
            sortable: true
        },
        {
            name: "Total Amount",
            selector: row => `₹${row.totalAmount}`,
            sortable: true
        },
        {
            name: "Payment Method",
            selector: row => row.paymentMethod,
            sortable: true
        },
        {
            name: "Status",
            selector: row => row.status,
            sortable: true
        },
        {
            name: "Items",
            cell: row => (
                <ul className="list-unstyled mb-0">
                    {row.items.map((item, index) => (
                        <li key={index}>{item.menuName} - {item.quantity} x ₹{item.price}</li>
                    ))}
                </ul>
            )
        },
        {
            name: "Action",
            cell: row => (
                <div className="d-flex gap-2">
                    {user && user.role === "admin" ? (
                        <select value={row.status} onChange={(e) => handleStatusChange(row._id, e.target.value)}>
                            <option value="Order Placed">Order Placed</option>
                            <option value="Ready to Pickup">Ready to Pickup</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Picked Up">Picked Up</option>
                        </select>
                    ) : (
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleStatusChange(row._id, "Cancelled")}
                            disabled={row.status !== "Order Placed" || token == null} 
                        >
                            Cancel
                        </button>
                    )}
                    {user && user.role === "admin" && row.shippingDetails?.email && (
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleResendEmail(row)}
                        >
                            Send Email
                        </button>
                    )}
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true
        }
    ];

    return (
        <>
            <Navbar />
            <div className="container mt-4">
                <h5>Order History</h5>

                <div className="row mb-3">
                    {!token && (
                        <div className="col-md-4 mb-2">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                            <button className="btn btn-primary mt-2" onClick={handleSearchByPhone}>
                                Search by Phone
                            </button>
                        </div>
                    )}
                    <div className="col-md-4 mb-2">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by name"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                    </div>
                    <div className="col-md-4 mb-2">
                        <select 
                            className="form-control"
                            value={searchDate}
                            onChange={(e) => setSearchDate(e.target.value)}
                        >
                            <option value="">All Dates</option>
                            <option value="today">Today</option>
                            <option value={moment().subtract(1, 'days').format("YYYY-MM-DD")}>Yesterday</option>
                            <option value={moment().subtract(7, 'days').format("YYYY-MM-DD")}>Last 7 Days</option>
                            <option value={moment().subtract(30, 'days').format("YYYY-MM-DD")}>Last 30 Days</option>
                        </select>
                    </div>
                </div>

                {error && <p className="text-danger">{error}</p>}
                {loading ? <p>Loading...</p> : (
                    <DataTable
                        columns={columns}
                        data={filteredOrders}
                        pagination
                        highlightOnHover
                        striped
                        responsive
                    />
                )}
            </div>
        </>
    );
}

export default OrderHistory;
