import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { toast } from 'react-toastify';
import { API_URL } from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { HelpCircle } from 'lucide-react';

const InStoreBilling = () => {
    const { user } = useContext(AuthContext);
    const [menuItems, setMenuItems] = useState([]);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [loading, setLoading] = useState(true);
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        if (user) {
            fetchMenuItems();
        }
    }, [user]);

    const fetchMenuItems = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/menu/instore`);
            let items = response.data.menu || [];
            items = items.filter(item => item.name && !isNaN(item.totalPrice));
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
            const payload = {
                items: cart.map(item => ({
                    itemId: item._id,
                    name: item.name,
                    quantity: item.quantity,
                    totalPrice: item.totalPrice,
                    photos: item.photos ? [item.photos] : [],
                    foodType: item.foodType
                })),
                totalAmount: cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0),
                paymentMethod,
                customerName,
                customerPhone
            };
            await axios.post(`${API_URL}/api/orders/instore-order`, payload);
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

    if (!user) {
        return <div>Please login to access in-store billing</div>;
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
                        <div className="flex items-center gap-2 mb-6">
                            <h1 className="text-2xl font-bold">In Store Billing</h1>
                            <button 
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                                onClick={() => setShowHelp(!showHelp)}
                                aria-label="Help"
                            >
                                <HelpCircle size={20} />
                            </button>
                        </div>
                        
                        {showHelp && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <h3 className="font-semibold text-blue-800 mb-2">How to use In-Store Billing:</h3>
                                <ol className="list-decimal pl-5 space-y-1 text-blue-700">
                                    <li>Search for menu items using the search bar</li>
                                    <li>Click "Add" button beside an item to add it to your cart</li>
                                    <li>Adjust quantities using the + and - buttons in the cart</li>
                                    <li>Remove items using the trash icon if needed</li>
                                    <li>Click "Proceed" when ready to generate the bill</li>
                                    <li>Enter customer details and payment method</li>
                                    <li>Submit to complete the order</li>
                                </ol>
                            </div>
                        )}

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
                                                            {item.photos ? (
                                                                <img src={item.photos} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                                                            ) : (
                                                                <div style={{ width: 48, height: 48, background: '#eee', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                                                                    <i className="bi bi-image" style={{ fontSize: 24 }}></i>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td>{item.name}</td>
                                                        <td>{['uncategorized', '', null, undefined].includes((item.category || '').toLowerCase()) ? '' : item.category}</td>
                                                        <td>{['general', '', null, undefined].includes((item.subcategory || '').toLowerCase()) ? '' : item.subcategory}</td>
                                                        <td>{item.foodType === 'veg' ? <span className="badge bg-success">Veg</span> : <span className="badge bg-danger">Non-Veg</span>}</td>
                                                        <td>₹{item.totalPrice}</td>
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
                                                    <div className="font-semibold">₹{item.totalPrice * item.quantity}</div>
                                                    <button className="btn btn-link text-danger p-0" onClick={() => handleRemoveFromCart(item._id)}>
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex justify-between font-bold text-lg pt-2">
                                            <span>Total</span>
                                            <span>₹{cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0)}</span>
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
                                                <input type="text" className="form-control" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Phone</label>
                                                <input type="text" className="form-control" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required />
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
    );
};

export default InStoreBilling;