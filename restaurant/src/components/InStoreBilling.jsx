import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { toast } from 'react-toastify';

const InStoreBilling = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/menu', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Always flatten menu items for the provided structure
            let items = [];
            const data = response.data.menu ? response.data.menu : response.data;
            if (Array.isArray(data)) {
                items = data.flatMap(cat =>
                    (cat.subcategories || []).flatMap(sub =>
                        (sub.items || []).map(item => ({
                            ...item,
                            price: parseFloat(item.totalPrice),
                            category: cat.name,
                            subcategory: sub.name
                        }))
                    )
                );
            }
            // Only keep items that have a name and price
            items = items.filter(item => item.name && !isNaN(item.price));
            setMenuItems(items);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch menu items');
            setLoading(false);
        }
    };

    const handleAddToCart = (item) => {
        const existing = cart.find(ci => ci._id === item._id);
        if (existing) {
            setCart(cart.map(ci => ci._id === item._id ? { ...ci, quantity: ci.quantity + 1 } : ci));
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
    };

    const handleChangeQuantity = (id, delta) => {
        setCart(cart => cart.map(item =>
            item._id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        ));
    };

    const handleRemoveFromCart = (id) => {
        setCart(cart.filter(item => item._id !== id));
    };

    const handleProceed = () => {
        if (cart.length === 0) {
            toast.error('Cart is empty');
            return;
        }
        setShowModal(true);
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                items: cart.map(item => ({
                    itemId: item._id,
                    name: item.name,
                    quantity: item.quantity,
                    totalPrice: item.price,
                    photos: item.photos || [],
                    isVeg: item.isVeg
                })),
                totalAmount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
                paymentMethod,
                customerName,
                customerPhone
            };
            await axios.post('http://localhost:5000/api/orders/instore-order', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('In-store order placed successfully');
            setCart([]);
            setShowModal(false);
            setCustomerName('');
            setCustomerPhone('');
            setPaymentMethod('COD');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to place order');
        }
    };

    const filteredMenu = menuItems.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(search.toLowerCase())) ||
        (item.subcategory && item.subcategory.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="container-fluid">
            <Navbar />
            <div className="row" style={{ marginTop: '48px' }}>
                <div className="d-none d-lg-block col-lg-2 px-0">
                    <Sidebar />
                </div>
                <div className="col-12 col-lg-10 px-0 ms-auto">
                    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                        <div className="max-w-7xl mx-auto">
                            <h1 className="text-2xl font-bold mb-6">In Store Billing</h1>
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Menu Table */}
                                <div className="flex-1 bg-white rounded-lg shadow-md p-4">
                                    <div className="mb-4 flex justify-between items-center">
                                        <input
                                            type="text"
                                            className="form-control w-64"
                                            placeholder="Search menu items..."
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                        />
                                    </div>
                                    {loading ? (
                                        <div className="text-center py-8">Loading menu...</div>
                                    ) : (
                                        <div className="overflow-auto" style={{ maxHeight: 500 }}>
                                            <table className="table table-hover align-middle">
                                                <thead>
                                                    <tr>
                                                        <th>Image</th>
                                                        <th>Name</th>
                                                        <th>Category</th>
                                                        <th>Subcategory</th>
                                                        <th>Type</th>
                                                        <th>Price</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredMenu.map(item => (
                                                        <tr key={item._id}>
                                                            <td>
                                                                {item.photos && item.photos.length > 0 ? (
                                                                    <img src={item.photos[0]} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                                                                ) : (
                                                                    <div style={{ width: 48, height: 48, background: '#eee', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                                                                        <i className="bi bi-image" style={{ fontSize: 24 }}></i>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td>{item.name}</td>
                                                            <td>{item.category}</td>
                                                            <td>{item.subcategory}</td>
                                                            <td>{item.isVeg ? <span className="badge bg-success">Veg</span> : <span className="badge bg-danger">Non-Veg</span>}</td>
                                                            <td>₹{item.price}</td>
                                                            <td>
                                                                <button className="btn btn-primary btn-sm" onClick={() => handleAddToCart(item)}>
                                                                    Add
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                                {/* Cart & Details */}
                                <div className="w-full lg:w-96 bg-white rounded-lg shadow-md p-4">
                                    <h2 className="text-lg font-semibold mb-4">Cart</h2>
                                    {cart.length === 0 ? (
                                        <div className="text-gray-500">No items in cart</div>
                                    ) : (
                                        <div className="space-y-4">
                                            {cart.map(item => (
                                                <div key={item._id} className="flex justify-between items-center border-b pb-2">
                                                    <div>
                                                        <div className="font-medium">{item.name}</div>
                                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                                            Qty:
                                                            <button className="btn btn-sm btn-outline-secondary px-2 py-0" style={{ minWidth: 28 }} onClick={() => handleChangeQuantity(item._id, -1)}>-</button>
                                                            <span className="mx-2">{item.quantity}</span>
                                                            <button className="btn btn-sm btn-outline-secondary px-2 py-0" style={{ minWidth: 28 }} onClick={() => handleChangeQuantity(item._id, 1)}>+</button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-semibold">₹{item.price * item.quantity}</div>
                                                        <button className="btn btn-link text-danger p-0" onClick={() => handleRemoveFromCart(item._id)}>
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="flex justify-between font-bold text-lg pt-2">
                                                <span>Total</span>
                                                <span>₹{cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}</span>
                                            </div>
                                            <button className="btn btn-success w-100" onClick={handleProceed}>
                                                Proceed
                                            </button>
                                        </div>
                                    )}
                                    {/* Modal for customer details */}
                                    {showModal && (
                                        <div className="fixed inset-0 bg-black/80 flex items-center justify-center" style={{ zIndex: 9999 }} onClick={() => setShowModal(false)}>
                                            <form className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative" onClick={e => e.stopPropagation()} onSubmit={handleSubmitOrder}>
                                                <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowModal(false)} aria-label="Close">
                                                    <i className="bi bi-x-lg"></i>
                                                </button>
                                                <h3 className="text-xl font-bold mb-4">Customer Details</h3>
                                                <div className="mb-3">
                                                    <label className="form-label">Name</label>
                                                    <input type="text" className="form-control" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Phone</label>
                                                    <input type="text" className="form-control" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Payment Method</label>
                                                    <select className="form-select" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                                                        <option value="COD">Cash on Delivery (COD)</option>
                                                        <option value="ONLINE">Online</option>
                                                    </select>
                                                </div>
                                                <div className="flex gap-2 mt-4">
                                                    <button type="submit" className="btn btn-success">Submit</button>
                                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InStoreBilling;
