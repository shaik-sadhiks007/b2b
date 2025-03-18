import { useContext, useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { HotelContext } from "../contextApi/HotelContextProvider";
import Navbar from "../components/Navbar";
import moment from "moment";

function OrderHistory() {
    const { user } = useContext(HotelContext);
    const token = localStorage.getItem("token");

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [phone, setPhone] = useState("");

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
                // setError(err.response?.data?.message || "Failed to fetch orders");
                setLoading(false);
            });
    }, [user, token]);

    const handleSearchByPhone = () => {
        if (!phone.trim()) {
            setError("Please enter a valid phone number");
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
                setError(err.response?.data?.error || "Failed to fetch orders");
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
            })
            .catch(err => console.error("Failed to update status", err));
    };

    const columns = [
        {
            name: "Date",
            selector: row => moment(row.createdAt).format("MMM DD, YYYY"),
            sortable: true
        },
        {
            name: "Total Amount",
            selector: row => `$${row.totalAmount}`,
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
                        <li key={index}>{item.menuName} - {item.quantity} x ${item.price}</li>
                    ))}
                </ul>
            )
        },
        {
            name: "Action",
            cell: row => user && user.role === "admin" ? (
                <select value={row.status} onChange={(e) => handleStatusChange(row._id, e.target.value)}>
                    <option value="Pending">Pending</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Cancelled">Cancel</option>
                    <option value="Delivered">Delivered</option>
                </select>
            ) : (
                <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleStatusChange(row._id, "Cancelled")}
                    disabled={row.status.toLowerCase() !== "pending" || token == null} 
                >
                    Cancel
                </button>
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

                {!token && (
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        <button className="btn btn-primary mt-2" onClick={handleSearchByPhone}>
                            Search
                        </button>
                    </div>
                )}

                {error && <p className="text-danger">{error}</p>}
                {loading ? <p>Loading...</p> : (
                    <DataTable
                        columns={columns}
                        data={orders}
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
