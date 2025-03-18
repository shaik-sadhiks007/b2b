import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

const CreateMenu = () => {
    const [templates, setTemplates] = useState([]);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        morning: [{ menuName: "", image: "", price: "", showPreview: false }],
        afternoon: [],
        evening: []
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
                console.error('Failed to fetch templates');
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const handleChange = (e, index) => {
        const { name, value } = e.target;
        const updatedMorning = [...formData.morning];
        updatedMorning[index] = {
            ...updatedMorning[index],
            [name]: value,
            showPreview: name === 'image' ? true : updatedMorning[index].showPreview
        };
        setFormData({ ...formData, morning: updatedMorning });
    };

    const handleTemplateSelect = (e, index) => {
        const selectedTemplate = templates.find(template => template._id === e.target.value);
        if (selectedTemplate) {
            const updatedMorning = [...formData.morning];
            updatedMorning[index] = {
                menuName: selectedTemplate.menuName,
                image: selectedTemplate.image,
                price: selectedTemplate.price,
                showPreview: true
            };
            setFormData({ ...formData, morning: updatedMorning });
        }
    };

    const addMenuItem = () => {
        setFormData({
            ...formData,
            morning: [...formData.morning, { menuName: "", image: "", price: "", showPreview: false }]
        });
    };

    const deleteMenuItem = (index) => {
        if (formData.morning.length > 1) {
            const updatedMorning = formData.morning.filter((_, i) => i !== index);
            setFormData({ ...formData, morning: updatedMorning });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        // Remove showPreview field from each item before sending
        const cleanedFormData = {
            ...formData,
            morning: formData.morning.map(({ showPreview, ...item }) => item)
        };

        try {
            const response = await fetch("http://localhost:5000/api/menu", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(cleanedFormData),
            });
            if (response.ok) {
                alert("Menu created successfully");
                setFormData({
                    date: new Date().toISOString().split('T')[0],
                    morning: [{ menuName: "", image: "", price: "", showPreview: false }],
                    afternoon: [],
                    evening: []
                });
            } else {
                alert("Failed to create menu");
            }
        } catch (error) {
            console.error("Error submitting form", error);
        }
    };

    return (
        <>
            <Navbar />
            <div className="container mt-5" style={{ background: "white", color: "black", padding: "20px", borderRadius: "10px" }}>
                <h2 className="text-center">Create Menu</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
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
                    <div className="mb-3">
                        <h4>Breakfast Menu</h4>
                        {formData.morning.map((item, index) => (
                            <div key={index} className="card mb-3 p-3">
                                <h5>Menu Item {index + 1}</h5>
                                <div className="mb-2">
                                    <label className="form-label">Select from Templates</label>
                                    <select 
                                        className="form-control mb-2"
                                        value={templates.find(t => 
                                            t.menuName === item.menuName && 
                                            t.price === item.price
                                        )?._id || ''}
                                        onChange={(e) => handleTemplateSelect(e, index)}
                                    >
                                        <option value="">Custom Item</option>
                                        {templates.map((template) => (
                                            <option key={template._id} value={template._id}>
                                                {template.menuName} - ₹{template.price}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <input
                                    type="text"
                                    className="form-control mb-2"
                                    placeholder="Menu Name"
                                    name="menuName"
                                    value={item.menuName}
                                    onChange={(e) => handleChange(e, index)}
                                    required
                                />
                                <input
                                    type="text"
                                    className="form-control mb-2"
                                    placeholder="Image URL"
                                    name="image"
                                    value={item.image}
                                    onChange={(e) => handleChange(e, index)}
                                />
                                {item.showPreview && item.image && (
                                    <div className="mb-2">
                                        <img 
                                            src={item.image} 
                                            alt={item.menuName} 
                                            style={{ maxWidth: '200px', height: 'auto' }}
                                            className="mt-2"
                                        />
                                    </div>
                                )}
                                <input
                                    type="number"
                                    className="form-control mb-2"
                                    placeholder="Price"
                                    name="price"
                                    value={item.price}
                                    onChange={(e) => handleChange(e, index)}
                                    required
                                />
                                {formData.morning.length > 1 && (
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() => deleteMenuItem(index)}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" className="btn btn-primary" onClick={addMenuItem}>
                            + Add Another Item
                        </button>
                    </div>
                    <button type="submit" className="btn btn-dark mt-3">Create Menu</button>
                </form>
            </div>
        </>
    );
};

export default CreateMenu;
