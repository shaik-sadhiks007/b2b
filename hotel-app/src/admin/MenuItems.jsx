import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const MenuItems = () => {
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem("token")
    // Fetch all menus
    const fetchMenus = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/menu/all-menus");
            const data = await response.json();
            if (response.ok) {
                setMenus(data);
            } else {
                console.error("Failed to fetch menus");
            }
        } catch (error) {
            console.error("Error fetching menus:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMenus();
    }, []);

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
                } else {
                    console.error("Failed to delete menu");
                }
            } catch (error) {
                console.error("Error deleting menu:", error);
            }
        }
    };

    // Define table columns
    const columns = [
        {
            name: "Date",
            selector: (row) => row.date,
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
                <div className="d-flex justify-content-between mb-3">
                    <button className="btn btn-primary" onClick={() => navigate("/create-menu")}>
                        Create Menu
                    </button>
                </div>
                <DataTable
                    columns={columns}
                    data={menus}
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
