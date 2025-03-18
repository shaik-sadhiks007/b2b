import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import DataTable from 'react-data-table-component';

const MenuTemplate = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [formData, setFormData] = useState({
        menuName: '',
        image: '',
        price: ''
    });

    const columns = [
        {
            name: 'Menu Name',
            selector: row => row.menuName,
            sortable: true,
        },
        {
            name: 'Image',
            cell: row => (
                <img 
                    src={row.image}
                    alt={row.menuName}
                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                />
            ),
        },
        {
            name: 'Price',
            selector: row => `₹${row.price}`,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: row => (
                <div>
                    <button 
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => handleEdit(row)}
                    >
                        Edit
                    </button>
                    <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(row._id)}
                    >
                        Delete
                    </button>
                </div>
            ),
        },
    ];

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
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedTemplate(null);
        setFormData({
            menuName: '',
            image: '',
            price: ''
        });
    };

    const handleModalShow = (mode = 'create') => {
        setModalMode(mode);
        setShowModal(true);
    };

    const handleEdit = (template) => {
        setSelectedTemplate(template);
        setFormData({
            menuName: template.menuName,
            image: template.image,
            price: template.price
        });
        handleModalShow('edit');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/menu-templates/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                fetchTemplates();
            } else {
                alert('Failed to delete template');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error deleting template');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            const url = modalMode === 'create' 
                ? 'http://localhost:5000/api/menu-templates'
                : `http://localhost:5000/api/menu-templates/${selectedTemplate._id}`;

            const response = await fetch(url, {
                method: modalMode === 'create' ? 'POST' : 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                fetchTemplates();
                handleModalClose();
            } else {
                alert(`Failed to ${modalMode} template`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert(`Error ${modalMode}ing template`);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' ? Number(value) : value
        }));
    };

    return (
        <>
            <Navbar />
            <div className="container mt-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Menu Templates</h2>
                    <button 
                        className="btn btn-primary"
                        onClick={() => handleModalShow('create')}
                    >
                        Create New Template
                    </button>
                </div>

                <DataTable
                    columns={columns}
                    data={templates}
                    pagination
                    progressPending={loading}
                    responsive
                    highlightOnHover
                    striped
                />

                {showModal && (
                    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {modalMode === 'create' ? 'Create New Template' : 'Edit Template'}
                                    </h5>
                                    <button 
                                        type="button" 
                                        className="btn-close" 
                                        onClick={handleModalClose}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label">Menu Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="menuName"
                                                value={formData.menuName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Image URL</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="image"
                                                value={formData.image}
                                                onChange={handleChange}
                                                required
                                            />
                                            {formData.image && (
                                                <img 
                                                    src={formData.image}
                                                    alt="Preview"
                                                    className="mt-2"
                                                    style={{ maxWidth: '200px', height: 'auto' }}
                                                />
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Price</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="d-flex justify-content-end gap-2">
                                            <button 
                                                type="button" 
                                                className="btn btn-secondary"
                                                onClick={handleModalClose}
                                            >
                                                Cancel
                                            </button>
                                            <button type="submit" className="btn btn-primary">
                                                {modalMode === 'create' ? 'Create' : 'Update'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default MenuTemplate; 