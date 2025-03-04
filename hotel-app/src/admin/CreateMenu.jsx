import React, { useState } from "react";
import Navbar from "../components/Navbar";

const CreateMenu = () => {
    const [formData, setFormData] = useState({
        date: "",
        morning: [{ menuName: "", image: "", price: "" }],
        afternoon: [{ menuName: "", image: "", price: "" }],
        evening: [{ menuName: "", image: "", price: "" }],
    });

    const handleChange = (e, time, index) => {
        const { name, value } = e.target;
        const updatedTime = [...formData[time]];
        updatedTime[index][name] = value;
        setFormData({ ...formData, [time]: updatedTime });
    };

    const addMenuItem = (time) => {
        setFormData({
            ...formData,
            [time]: [...formData[time], { menuName: "", image: "", price: "" }],
        });
    };

    const deleteMenuItem = (time, index) => {
        if (formData[time].length > 1) {
            const updatedTime = formData[time].filter((_, i) => i !== index);
            setFormData({ ...formData, [time]: updatedTime });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://localhost:5000/api/menu", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                alert("Menu created successfully");
                setFormData({
                    date: "",
                    morning: [{ menuName: "", image: "", price: "" }],
                    afternoon: [{ menuName: "", image: "", price: "" }],
                    evening: [{ menuName: "", image: "", price: "" }],
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
                    {["morning", "afternoon", "evening"].map((time) => (
                        <div key={time} className="mb-3">
                            <h4>{time.charAt(0).toUpperCase() + time.slice(1)} Menu</h4>
                            {formData[time].map((item, index) => (
                                <div key={index} className="mb-2">
                                    <h5>Menu {index + 1}</h5>
                                    <input
                                        type="text"
                                        className="form-control mb-1"
                                        placeholder="Menu Name"
                                        name="menuName"
                                        value={item.menuName}
                                        onChange={(e) => handleChange(e, time, index)}
                                        required
                                    />
                                    <input
                                        type="text"
                                        className="form-control mb-1"
                                        placeholder="Image URL"
                                        name="image"
                                        value={item.image}
                                        onChange={(e) => handleChange(e, time, index)}
                                    />
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Price"
                                        name="price"
                                        value={item.price}
                                        onChange={(e) => handleChange(e, time, index)}
                                    />
                                    {formData[time].length > 1 && (
                                        <button
                                            type="button"
                                            className="btn btn-danger mt-2"
                                            onClick={() => deleteMenuItem(time, index)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button type="button" className="btn btn-primary mt-2" onClick={() => addMenuItem(time)}>
                                + Add Item
                            </button>
                        </div>
                    ))}
                    <button type="submit" className="btn btn-dark mt-3">Submit</button>
                </form>
            </div>
        </>
    );
};

export default CreateMenu;
