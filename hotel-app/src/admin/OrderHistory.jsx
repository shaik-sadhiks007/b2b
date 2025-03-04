import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { HotelContext } from "../contextApi/HotelContextProvider";
import Navbar from "../components/Navbar";

function OrderHistory() {
    const { user } = useContext(HotelContext);
    const token = localStorage.getItem("token");

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user || !user.role || !token) return;

        const url = user.role === "user"
            ? "http://localhost:5000/api/orders/order-history/user"
            : "http://localhost:5000/api/orders/order-history";

        axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                setOrders(response.data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.response?.data?.message || "Failed to fetch orders");
                setLoading(false);
            });

    }, [user, token]);

    if (loading) return <p>Loading orders...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <>
            <Navbar />
            <div className="container mt-4">
                <h5>Order History</h5>
                {orders.length === 0 ? (
                    <p>No orders found.</p>
                ) : (
                    <table className="table table-striped table-bordered">
                        <thead className="thead-dark">
                            <tr>
                                <th>Order ID</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th>Items</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id}>
                                    <td>{order._id}</td>
                                    <td>${order.totalAmount}</td>
                                    <td>{order.status}</td>
                                    <td>
                                        <ul className="list-unstyled mb-0">
                                            {order.items.map((item, index) => (
                                                <li key={index}>
                                                    {item.menuName} - {item.quantity} x ${item.price}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}

export default OrderHistory;
