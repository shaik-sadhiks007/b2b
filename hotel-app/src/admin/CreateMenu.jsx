import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { toast } from 'react-toastify';

const CreateMenu = () => {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplates, setSelectedTemplates] = useState([]);
    const [customItems, setCustomItems] = useState([]);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        morning: []
    });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/menu-templates');
            if (response.ok) {
                const data = await response.json();
                setTemplates(data);
            } else {
                toast.error('Failed to fetch templates');
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
            toast.error('Error fetching templates');
        }
    };

    const handleTemplateToggle = (template) => {
        setSelectedTemplates(prev => {
            const isSelected = prev.some(t => t._id === template._id);
            if (isSelected) {
                return prev.filter(t => t._id !== template._id);
            } else {
                return [...prev, { ...template, quantity: 1 }];
            }
        });
    };

    const handleQuantityChange = (templateId, value) => {
        setSelectedTemplates(prev => 
            prev.map(template => 
                template._id === templateId 
                    ? { ...template, quantity: Math.max(1, parseInt(value) || 1) }
                    : template
            )
        );
    };

    const handleCustomItemChange = (index, field, value) => {
        const updatedCustomItems = [...customItems];
        updatedCustomItems[index] = {
            ...updatedCustomItems[index],
            [field]: value
        };
        setCustomItems(updatedCustomItems);
    };

    const addCustomItem = () => {
        setCustomItems([...customItems, { menuName: "", image: "", price: "", quantity: 1 }]);
    };

    const removeCustomItem = (index) => {
        setCustomItems(customItems.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        // Combine selected templates and custom items with quantities
        const menuItems = [
            ...selectedTemplates.map(template => ({
                menuName: template.menuName,
                image: template.image,
                price: template.price,
                quantity: template.quantity
            })),
            ...customItems.filter(item => item.menuName && item.price).map(item => ({
                ...item,
                quantity: item.quantity || 1
            }))
        ];

        if (menuItems.length === 0) {
            toast.warning("Please select at least one menu item");
            return;
        }

        const menuData = {
            date: formData.date,
            morning: menuItems
        };

        try {
            const response = await fetch("http://localhost:5000/api/menu", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(menuData),
            });

            if (response.ok) {
                toast.success("Menu created successfully");
                // Reset form
                setFormData({
                    date: new Date().toISOString().split('T')[0],
                    morning: []
                });
                setSelectedTemplates([]);
                setCustomItems([]);
            } else {
                toast.error("Failed to create menu");
            }
        } catch (error) {
            console.error("Error submitting form", error);
            toast.error("Error creating menu");
        }
    };

    return (
        <>
            <Navbar />
            <div className="container mt-5" style={{ background: "white", color: "black", padding: "20px", borderRadius: "10px" }}>
                <h2 className="text-center">Create Menu</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="form-label">Date</label>
                        <input
                            type="date"
                            className="form-control"
                            name="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <h4>Menu Templates</h4>
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Select</th>
                                        <th>Image</th>
                                        <th>Menu Name</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {templates.map((template) => (
                                        <tr key={template._id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    checked={selectedTemplates.some(t => t._id === template._id)}
                                                    onChange={() => handleTemplateToggle(template)}
                                                />
                                            </td>
                                            <td>
                                                {template.image && (
                                                    <img
                                                        src={template.image}
                                                        alt={template.menuName}
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                    />
                                                )}
                                            </td>
                                            <td>{template.menuName}</td>
                                            <td>₹{template.price}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    min="1"
                                                    value={selectedTemplates.find(t => t._id === template._id)?.quantity || 1}
                                                    onChange={(e) => handleQuantityChange(template._id, e.target.value)}
                                                    disabled={!selectedTemplates.some(t => t._id === template._id)}
                                                />
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn btn-warning btn-sm"
                                                    onClick={() => handleTemplateToggle(template)}
                                                >
                                                    {selectedTemplates.some(t => t._id === template._id) ? 'Remove' : 'Add'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h4>Custom Menu Items</h4>
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Image URL</th>
                                        <th>Menu Name</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customItems.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.menuName}
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                    />
                                                )}
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    placeholder="Enter image URL"
                                                    value={item.image}
                                                    onChange={(e) => handleCustomItemChange(index, 'image', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm"
                                                    placeholder="Menu Name"
                                                    value={item.menuName}
                                                    onChange={(e) => handleCustomItemChange(index, 'menuName', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    placeholder="Price"
                                                    value={item.price}
                                                    onChange={(e) => handleCustomItemChange(index, 'price', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    min="1"
                                                    value={item.quantity || 1}
                                                    onChange={(e) => handleCustomItemChange(index, 'quantity', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => removeCustomItem(index)}
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={addCustomItem}
                        >
                            + Add Custom Item
                        </button>
                    </div>

                    <button type="submit" className="btn btn-dark">Create Menu</button>
                </form>
            </div>
        </>
    );
};

export default CreateMenu;
