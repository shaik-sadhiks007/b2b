import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Phone, MapPin, Car, Shield, Edit, Save, X, Camera } from 'lucide-react';
import { updateProfileThunk } from '../../../redux/slices/authSlice';

function Profile() {
  const { user } = useSelector((state) => state.auth);
  const deliveryPartner = useSelector((state) => state.deliveryPartnerReg);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobileNumber: user?.mobileNumber || '',
    gender: user?.gender || '',
    vehicleType: user?.vehicleType || '',
    vehicleNumber: user?.vehicleNumber || '',
    serviceLocation: user?.serviceLocation || '',
    photo: user?.photo || '',
    presentAddress: {
      streetAddress: user?.presentAddress?.streetAddress || '',
      city: user?.presentAddress?.city || '',
      district: user?.presentAddress?.district || '',
      state: user?.presentAddress?.state || '',
      pinCode: user?.presentAddress?.pinCode || ''
    }
  });
  const [originalData, setOriginalData] = useState({
    name: user?.name || '',
    mobileNumber: user?.mobileNumber || '',
    gender: user?.gender || '',
    vehicleType: user?.vehicleType || '',
    vehicleNumber: user?.vehicleNumber || '',
    serviceLocation: user?.serviceLocation || '',
    photo: user?.photo || '',
    presentAddress: {
      streetAddress: user?.presentAddress?.streetAddress || '',
      city: user?.presentAddress?.city || '',
      district: user?.presentAddress?.district || '',
      state: user?.presentAddress?.state || '',
      pinCode: user?.presentAddress?.pinCode || ''
    }
  });

  // Update form data when user data changes
  React.useEffect(() => {
    const userData = {
      name: user?.name || '',
      mobileNumber: user?.mobileNumber || '',
      gender: user?.gender || '',
      vehicleType: user?.vehicleType || '',
      vehicleNumber: user?.vehicleNumber || '',
      serviceLocation: user?.serviceLocation || '',
      photo: user?.photo || '',
      presentAddress: {
        streetAddress: user?.presentAddress?.streetAddress || '',
        city: user?.presentAddress?.city || '',
        district: user?.presentAddress?.district || '',
        state: user?.presentAddress?.state || '',
        pinCode: user?.presentAddress?.pinCode || ''
      }
    };
    
    setFormData(userData);
    setOriginalData(userData);
  }, [user]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
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
        [field]: value
      }));
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          photo: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getChangedFields = () => {
    const changedFields = {};
    
    // Check each field for changes
    Object.keys(formData).forEach(key => {
      if (key === 'presentAddress') {
        const addressChanged = {};
        let hasAddressChanges = false;
        Object.keys(formData.presentAddress).forEach(addressKey => {
          if (formData.presentAddress[addressKey] !== originalData.presentAddress[addressKey]) {
            addressChanged[addressKey] = formData.presentAddress[addressKey];
            hasAddressChanges = true;
          }
        });
        if (hasAddressChanges) {
          changedFields.presentAddress = addressChanged;
        }
      } else {
        if (formData[key] !== originalData[key]) {
          changedFields[key] = formData[key];
        }
      }
    });
    
    return changedFields;
  };

  const handleSave = async () => {
    try {
      const changedFields = getChangedFields();
      if (Object.keys(changedFields).length === 0) {
        setIsEditing(false);
        return;
      }
      
      const result = await dispatch(updateProfileThunk(changedFields));
      if (updateProfileThunk.fulfilled.match(result)) {
        setIsEditing(false);
        // Update original data with new values
        setOriginalData(formData);
        console.log('Profile updated successfully');
      } else {
        console.error('Error updating profile:', result.payload);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  return (
    <div className="container">
      <div className="">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          {user && (
            <div className="flex space-x-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        {user ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Profile Header */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                {isEditing ? (
                  <div className="relative">
                    <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden">
                      {formData.photo ? (
                        <img 
                          src={formData.photo} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.name ? user.name[0].toUpperCase() : 'D'
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1 hover:bg-blue-700 transition"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden">
                    {user.photo ? (
                      <img 
                        src={user.photo} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.name ? user.name[0].toUpperCase() : 'D'
                    )}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{user.name || 'Delivery Partner'}</h2>
                <p className="text-gray-600">{user.mobileNumber || user.email}</p>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{user.name || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.mobileNumber}
                        onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {user.mobileNumber || 'Not provided'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    {isEditing ? (
                      <select
                        value={formData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{user.gender || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      deliveryPartner.form.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {deliveryPartner.form.status || 'pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Car className="w-5 h-5 mr-2" />
                  Vehicle Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                    {isEditing ? (
                      <select
                        value={formData.vehicleType}
                        onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Vehicle Type</option>
                        <option value="normal">Normal</option>
                        <option value="electric">Electric</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{user.vehicleType || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.vehicleNumber}
                        onChange={(e) => handleInputChange('vehicleNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{user.vehicleNumber || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Address Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.presentAddress.streetAddress}
                        onChange={(e) => handleInputChange('presentAddress.streetAddress', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{user.presentAddress?.streetAddress || 'Not provided'}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.presentAddress.city}
                          onChange={(e) => handleInputChange('presentAddress.city', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{user.presentAddress?.city || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.presentAddress.district}
                          onChange={(e) => handleInputChange('presentAddress.district', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{user.presentAddress?.district || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.presentAddress.state}
                          onChange={(e) => handleInputChange('presentAddress.state', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{user.presentAddress?.state || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.presentAddress.pinCode}
                        onChange={(e) => handleInputChange('presentAddress.pinCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{user.presentAddress?.pinCode || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Service Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Location</label>
                    {isEditing ? (
                      <select
                        value={formData.serviceLocation}
                        onChange={(e) => handleInputChange('serviceLocation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Service Location</option>
                        <option value="satyanarayanapuram">Satyanarayanapuram</option>
                        <option value="vijayawada">Vijayawada</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{user.serviceLocation || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Online Status</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      deliveryPartner.form.online 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {deliveryPartner.form.online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading profile...</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;