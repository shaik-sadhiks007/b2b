import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import moment from "moment";
import { toast } from 'react-toastify';

const MenuItems = () => {
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchDate, setSearchDate] = useState("");
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    // Fetch all menus
    const fetchMenus = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/menu/all-menus");
            const data = await response.json();
            if (response.ok) {
                setMenus(data);
            } else {
                toast.error("Failed to fetch menus");
            }
        } catch (error) {
            console.error("Error fetching menus:", error);
            toast.error("Error fetching menus");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMenus();
    }, []);

    // Filter menus based on date
    const filteredMenus = menus.filter(menu => {
        if (!searchDate) return true;
        
        const menuDate = moment(menu.date);
        if (searchDate === "today") {
            return menuDate.isSame(moment(), 'day');
        } else if (searchDate === "yesterday") {
            return menuDate.isSame(moment().subtract(1, 'days'), 'day');
        } else if (searchDate === "last7days") {
            return menuDate.isAfter(moment().subtract(7, 'days'));
        } else if (searchDate === "last30days") {
            return menuDate.isAfter(moment().subtract(30, 'days'));
        }
        return true;
    });

    // Delete menu by date
    const handleDelete = async (date) => {
        if (window.confirm("Are you sure you want to delete this menu?")) {
            try {
                const response = await fetch(`http://localhost:5000/api/menu/${date}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                if (response.ok) {
                    setMenus(menus.filter((menu) => menu.date !== date));
                    toast.success("Menu deleted successfully");
                } else {
                    toast.error("Failed to delete menu");
                }
            } catch (error) {
                console.error("Error deleting menu:", error);
                toast.error("Error deleting menu");
            }
        }
    };

    // Define table columns
    const columns = [
        {
            name: "Date",
            selector: (row) => moment(row.date).format("MMM DD, YYYY"),
            sortable: true,
        },
        {
            name: "Menu",
            selector: (row) => row.morning.map(item => item.menuName).join(", "),
        },
        // {
        //     name: "Afternoon Menu",
        //     selector: (row) => row.afternoon.map(item => item.menuName).join(", "),
        // },
        // {
        //     name: "Evening Menu",
        //     selector: (row) => row.evening.map(item => item.menuName).join(", "),
        // },
        {
            name: "Actions",
            cell: (row) => (
                <>
                    <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => navigate(`/edit-menu/${row.date}`)}
                    >
                        Edit
                    </button>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(row.date)}
                    >
                        Delete
                    </button>
                </>
            ),
        },
    ];

    return (
        <>
            <Navbar />
            <div className="container mt-4">
                <h2 className="text-center mb-3">Menus</h2>
                <div className="row mb-3">
                    <div className="col-md-6">
                        <div className="d-flex justify-content-between">
                            <button className="btn btn-primary" onClick={() => navigate("/create-menu")}>
                                Create Menu
                            </button>
                            <select 
                                className="form-control w-50"
                                value={searchDate}
                                onChange={(e) => setSearchDate(e.target.value)}
                            >
                                <option value="">All Menus</option>
                                <option value="today">Today</option>
                                <option value="yesterday">Yesterday</option>
                                <option value="last7days">Last 7 Days</option>
                                <option value="last30days">Last 30 Days</option>
                            </select>
                        </div>
                    </div>
                </div>
                <DataTable
                    columns={columns}
                    data={filteredMenus}
                    progressPending={loading}
                    pagination
                    highlightOnHover
                    responsive
                />
            </div>
        </>
    );
};

export default MenuItems;
