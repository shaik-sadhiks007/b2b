import { useState, useEffect, useContext } from 'react';
import { HotelContext } from '../contextApi/HotelContextProvider';
import Navbar from './Navbar';

function AddressManagement() {
    // const { token } = useContext(HotelContext);
    const [address, setAddress] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        streetAddress: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        phone: '',
        email: '',
        businessHours: {
            open: '09:00',
            close: '22:00'
        },
        socialMedia: {
            facebook: '',
            twitter: '',
            instagram: ''
        }
    });

    useEffect(() => {
        fetchAddress();
    }, []);

    const fetchAddress = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/address`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    setAddress(null);
                    setFormData({
                        streetAddress: '',
                        city: '',
                        state: '',
                        postalCode: '',
                        country: '',
                        phone: '',
                        email: '',
                        businessHours: {
                            open: '09:00',
                            close: '22:00'
                        },
                        socialMedia: {
                            facebook: '',
                            twitter: '',
                            instagram: ''
                        }
                    });
                } else {
                    throw new Error('Failed to fetch address');
                }
            } else {
                const data = await response.json();
                setAddress(data);
                if (data) {
                    setFormData({
                        ...data,
                        businessHours: data.businessHours || {
                            open: '09:00',
                            close: '22:00'
                        },
                        socialMedia: data.socialMedia || {
                            facebook: '',
                            twitter: '',
                            instagram: ''
                        }
                    });
                }
            }
        } catch (error) {
            setError('Failed to fetch address');
            setAddress(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/address${address ? `/${address._id}` : ''}`, {
                method: address ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to save address');
            }

            setAddress(data);
            setShowForm(false);
            fetchAddress();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/address/${address._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete address');
            }

            setAddress(null);
            setFormData({
                streetAddress: '',
                city: '',
                state: '',
                postalCode: '',
                country: '',
                phone: '',
                email: '',
                businessHours: {
                    open: '09:00',
                    close: '22:00'
                },
                socialMedia: {
                    facebook: '',
                    twitter: '',
                    instagram: ''
                }
            });
        } catch (error) {
            setError(error.message);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    if (loading) return <div className="container mt-5"><div className="alert alert-info">Loading...</div></div>;

    return (

        <>
            <Navbar />
            <div className="container my-5">
                <h2 className="text-center mb-4">Company Address Management</h2>

                {!showForm ? (
                    <div className="card">
                        <div className="card-body">
                            {address ? (
                                <>
                                    <div className="table-responsive">
                                        <table className="table">
                                            <tbody>
                                                <tr>
                                                    <th>Street Address</th>
                                                    <td>{address.streetAddress}</td>
                                                </tr>
                                                <tr>
                                                    <th>City</th>
                                                    <td>{address.city}</td>
                                                </tr>
                                                <tr>
                                                    <th>State</th>
                                                    <td>{address.state}</td>
                                                </tr>
                                                <tr>
                                                    <th>Postal Code</th>
                                                    <td>{address.postalCode}</td>
                                                </tr>
                                                <tr>
                                                    <th>Country</th>
                                                    <td>{address.country}</td>
                                                </tr>
                                                <tr>
                                                    <th>Phone</th>
                                                    <td>{address.phone}</td>
                                                </tr>
                                                <tr>
                                                    <th>Email</th>
                                                    <td>{address.email}</td>
                                                </tr>
                                                <tr>
                                                    <th>Business Hours</th>
                                                    <td>
                                                        {address.businessHours ? 
                                                            `${address.businessHours.open} - ${address.businessHours.close}` 
                                                            : 'Not specified'
                                                        }
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>Social Media</th>
                                                    <td>
                                                        {address.socialMedia ? (
                                                            <>
                                                                {address.socialMedia.facebook && <div>Facebook: {address.socialMedia.facebook}</div>}
                                                                {address.socialMedia.twitter && <div>Twitter: {address.socialMedia.twitter}</div>}
                                                                {address.socialMedia.instagram && <div>Instagram: {address.socialMedia.instagram}</div>}
                                                            </>
                                                        ) : (
                                                            'No social media links'
                                                        )}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-3">
                                        <button className="btn btn-primary me-2" onClick={() => setShowForm(true)}>Update</button>
                                        <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center">
                                    <p>No address information found.</p>
                                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>Create Address</button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="card">
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="streetAddress" className="form-label">Street Address</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="streetAddress"
                                        name="streetAddress"
                                        value={formData.streetAddress}
                                        onChange={handleChange}
                                        required
                                        minLength={5}
                                    />
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label htmlFor="city" className="form-label">City</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                            minLength={2}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="state" className="form-label">State</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="state"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            required
                                            minLength={2}
                                        />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label htmlFor="postalCode" className="form-label">Postal Code</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="postalCode"
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleChange}
                                            required
                                            pattern="[0-9]{6}"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="country" className="form-label">Country</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="country"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            required
                                            minLength={2}
                                        />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label htmlFor="phone" className="form-label">Phone</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            pattern="[0-9]{10}"
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label htmlFor="businessHours.open" className="form-label">Opening Time</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            id="businessHours.open"
                                            name="businessHours.open"
                                            value={formData.businessHours.open}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="businessHours.close" className="form-label">Closing Time</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            id="businessHours.close"
                                            name="businessHours.close"
                                            value={formData.businessHours.close}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Social Media</label>
                                    <input
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="Facebook URL"
                                        name="socialMedia.facebook"
                                        value={formData.socialMedia.facebook}
                                        onChange={handleChange}
                                    />
                                    <input
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="Twitter URL"
                                        name="socialMedia.twitter"
                                        value={formData.socialMedia.twitter}
                                        onChange={handleChange}
                                    />
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Instagram URL"
                                        name="socialMedia.instagram"
                                        value={formData.socialMedia.instagram}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? 'Saving...' : (address ? 'Update' : 'Create')}
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>

    );
}

export default AddressManagement; 