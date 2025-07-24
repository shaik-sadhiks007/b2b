import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setFormField,
  setStep,
  resetForm,
  registerDeliveryPartner,
  updateDeliveryPartnerStep,
  getDeliveryPartnerProfile
} from '../../../redux/slices/deliveryPartnerRegSlice';
import RegistrationSidebar from '../../../components/RegistrationSidebar';
import { useNavigate } from 'react-router-dom';

function StyledInput({ label, ...props }) {
  return (
    <label style={{ display: 'block', marginBottom: 18 }}>
      <span style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>{label}</span>
      <input
        {...props}
        style={{
          width: '100%',
          padding: '10px 14px',
          border: '1.5px solid #cfd8dc',
          borderRadius: 8,
          fontSize: 15,
          outline: 'none',
          background: '#f9fbfc',
          transition: 'border 0.2s',
          marginBottom: 2,
        }}
        onFocus={e => (e.target.style.border = '1.5px solid #1976d2')}
        onBlur={e => (e.target.style.border = '1.5px solid #cfd8dc')}
      />
    </label>
  );
}

function StyledSelect({ label, children, ...props }) {
  return (
    <label style={{ display: 'block', marginBottom: 18 }}>
      <span style={{ display: 'block', fontWeight: 500, marginBottom: 6 }}>{label}</span>
      <select
        {...props}
        style={{
          width: '100%',
          padding: '10px 14px',
          border: '1.5px solid #cfd8dc',
          borderRadius: 8,
          fontSize: 15,
          background: '#f9fbfc',
          outline: 'none',
          marginBottom: 2,
        }}
        onFocus={e => (e.target.style.border = '1.5px solid #1976d2')}
        onBlur={e => (e.target.style.border = '1.5px solid #cfd8dc')}
      >
        {children}
      </select>
    </label>
  );
}

function DeliveryPartnerReg() {
  const dispatch = useDispatch();
  const { step, form, id, loading } = useSelector((state) => state.deliveryPartnerReg);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();
  const filePhotoRef = useRef();
  const fileAadhaarFrontRef = useRef();
  const fileAadhaarBackRef = useRef();

  // Fetch profile on mount if not loaded
  useEffect(() => {
    if (isAuthenticated && !id) {
      dispatch(getDeliveryPartnerProfile());
    }
    // Only redirect if not authenticated and not loading
    // if (!isAuthenticated && !loading) {
    //   navigate('/login');
    // }
  }, [dispatch, isAuthenticated, id, navigate, loading]);

  // Show loading spinner if loading and not authenticated
  if (!isAuthenticated && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-blue-600 font-semibold">Loading...</div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    if (type === 'file') {
      if (name === 'photo') dispatch(setFormField({ photo: files[0] }));
      else if (name === 'aadhaarFront') dispatch(setFormField({ aadhaar: { ...form.aadhaar, front: files[0] } }));
      else if (name === 'aadhaarBack') dispatch(setFormField({ aadhaar: { ...form.aadhaar, back: files[0] } }));
    } else if (type === 'checkbox') {
      dispatch(setFormField({ [name]: checked }));
    } else {
      dispatch(setFormField({ [name]: value }));
    }
  };

  const prevStep = () => dispatch(setStep(step - 1));
  const goToStep = (n) => dispatch(setStep(n));

  const handleNext = async () => {
    if (step === 1) {
      let result;
      if (id) {
        // If id exists, update instead of register
        result = await dispatch(updateDeliveryPartnerStep({ id, form, step: 1 }));
      } else {
        result = await dispatch(registerDeliveryPartner(form));
      }
      if (result.meta.requestStatus === 'fulfilled') {
        dispatch(setStep(step + 1));
      }
    } else if (step >= 2 && step <= 4) {
      if (!id) return alert('Registration ID missing. Please start from step 1.');
      const result = await dispatch(updateDeliveryPartnerStep({ id, form, step }));
      if (result.meta.requestStatus === 'fulfilled') {
        dispatch(setStep(step + 1));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.termsAccepted) return alert('Please accept the terms and conditions.');
    alert('Registration submitted!');
    dispatch(resetForm());
  };

  return (
    <div className="bg-slate-100 min-h-screen p-0">
      <div className="max-w-5xl mx-auto my-10 bg-white rounded-2xl shadow-lg flex flex-col md:flex-row min-h-[600px]">
        <div className="md:w-1/3 w-full border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
          <RegistrationSidebar currentStep={step} onStepClick={goToStep} />
        </div>
        <div className="flex-1 p-6 sm:p-10 min-w-0">
          <h2 className="mb-8 font-bold text-blue-700 text-2xl sm:text-3xl">Delivery Partner Registration</h2>
          <form onSubmit={handleSubmit} autoComplete="off">
            {step === 1 && (
              <div>
                <StyledInput label="Name" name="name" value={form.name} onChange={handleChange} required placeholder="Enter your full name" />
                <StyledSelect label="Gender" name="gender" value={form.gender} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </StyledSelect>
                <StyledInput label="Mobile Number" name="mobileNumber" value={form.mobileNumber} onChange={handleChange} required maxLength={10} placeholder="Enter 10 digit mobile number" />
                <div className="mt-6 mb-2 font-semibold text-slate-700">Present Address</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StyledInput label="Street Address" name="presentAddress.streetAddress" value={form.presentAddress?.streetAddress || ''} onChange={e => dispatch(setFormField({ presentAddress: { ...form.presentAddress, streetAddress: e.target.value } }))} required placeholder="Street Address" />
                  <StyledInput label="Pin Code" name="presentAddress.pinCode" value={form.presentAddress?.pinCode || ''} onChange={e => dispatch(setFormField({ presentAddress: { ...form.presentAddress, pinCode: e.target.value } }))} required placeholder="Pin Code" />
                  <StyledInput label="City" name="presentAddress.city" value={form.presentAddress?.city || ''} onChange={e => dispatch(setFormField({ presentAddress: { ...form.presentAddress, city: e.target.value } }))} required placeholder="City" />
                  <StyledInput label="District" name="presentAddress.district" value={form.presentAddress?.district || ''} onChange={e => dispatch(setFormField({ presentAddress: { ...form.presentAddress, district: e.target.value } }))} required placeholder="District" />
                  <StyledSelect label="State" name="presentAddress.state" value={form.presentAddress?.state || 'Andhra Pradesh'} onChange={e => dispatch(setFormField({ presentAddress: { ...form.presentAddress, state: e.target.value } }))} required>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Other">Other</option>
                  </StyledSelect>
                  <StyledInput label="Country" name="presentAddress.country" value={form.presentAddress?.country || 'India'} readOnly />
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                  className="mt-4 bg-blue-600 text-white rounded-lg px-8 py-2 font-semibold text-lg shadow hover:bg-blue-700 disabled:opacity-60"
                >
                  {loading ? 'Saving...' : 'Next'}
                </button>
              </div>
            )}
            {step === 2 && (
              <div>
                <StyledInput label="Vehicle Number" name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} required placeholder="Enter vehicle number" />
                <StyledSelect label="Vehicle Type" name="vehicleType" value={form.vehicleType} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="electric">Electric Bike</option>
                  <option value="normal">Normal Bike</option>
                </StyledSelect>
                <button type="button" onClick={prevStep} style={{ marginRight: 12, background: '#e3f0fc', color: '#1976d2', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Back</button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                  style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginLeft: 8, opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? 'Saving...' : 'Next'}
                </button>
              </div>
            )}
            {step === 3 && (
              <div>
                <div className="mb-2 font-semibold text-slate-700">Photo</div>
                <div className="flex items-center gap-4 mb-6 flex-wrap">
                  {form.photo && typeof form.photo === 'string' && (
                    <div className="relative group">
                      <img src={form.photo} alt="Preview" className="w-16 h-16 rounded-full object-cover border" />
                      <button type="button" aria-label="Remove photo" onClick={() => dispatch(setFormField({ photo: null }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100 transition hover:bg-red-600">&times;</button>
                    </div>
                  )}
                  {form.photo && typeof form.photo === 'object' && (
                    <div className="relative group">
                      <img src={URL.createObjectURL(form.photo)} alt="Preview" className="w-16 h-16 rounded-full object-cover border" />
                      <button type="button" aria-label="Remove photo" onClick={() => dispatch(setFormField({ photo: null }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100 transition hover:bg-red-600">&times;</button>
                    </div>
                  )}
                  <input type="file" name="photo" accept="image/*" onChange={handleChange} className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" required={!form.photo} />
                </div>
                <div className="mb-2 font-semibold text-slate-700">Aadhaar Front</div>
                <div className="flex items-center gap-4 mb-6 flex-wrap">
                  {form.aadhaar?.front && typeof form.aadhaar.front === 'string' && (
                    <div className="relative group">
                      <img src={form.aadhaar.front} alt="Aadhaar Front Preview" className="w-16 h-16 rounded object-cover border" />
                      <button type="button" aria-label="Remove Aadhaar front" onClick={() => dispatch(setFormField({ aadhaar: { ...form.aadhaar, front: null } }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100 transition hover:bg-red-600">&times;</button>
                    </div>
                  )}
                  {form.aadhaar?.front && typeof form.aadhaar.front === 'object' && (
                    <div className="relative group">
                      <img src={URL.createObjectURL(form.aadhaar.front)} alt="Aadhaar Front Preview" className="w-16 h-16 rounded object-cover border" />
                      <button type="button" aria-label="Remove Aadhaar front" onClick={() => dispatch(setFormField({ aadhaar: { ...form.aadhaar, front: null } }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100 transition hover:bg-red-600">&times;</button>
                    </div>
                  )}
                  <input type="file" name="aadhaarFront" accept="image/*" ref={fileAadhaarFrontRef} onChange={handleChange} className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" required={!form.aadhaar?.front} />
                </div>
                <div className="mb-2 font-semibold text-slate-700">Aadhaar Back</div>
                <div className="flex items-center gap-4 mb-6 flex-wrap">
                  {form.aadhaar?.back && typeof form.aadhaar.back === 'string' && (
                    <div className="relative group">
                      <img src={form.aadhaar.back} alt="Aadhaar Back Preview" className="w-16 h-16 rounded object-cover border" />
                      <button type="button" aria-label="Remove Aadhaar back" onClick={() => dispatch(setFormField({ aadhaar: { ...form.aadhaar, back: null } }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100 transition hover:bg-red-600">&times;</button>
                    </div>
                  )}
                  {form.aadhaar?.back && typeof form.aadhaar.back === 'object' && (
                    <div className="relative group">
                      <img src={URL.createObjectURL(form.aadhaar.back)} alt="Aadhaar Back Preview" className="w-16 h-16 rounded object-cover border" />
                      <button type="button" aria-label="Remove Aadhaar back" onClick={() => dispatch(setFormField({ aadhaar: { ...form.aadhaar, back: null } }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100 transition hover:bg-red-600">&times;</button>
                    </div>
                  )}
                  <input type="file" name="aadhaarBack" accept="image/*" ref={fileAadhaarBackRef} onChange={handleChange} className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" required={!form.aadhaar?.back} />
                </div>
                <button type="button" onClick={prevStep} style={{ marginRight: 12, background: '#e3f0fc', color: '#1976d2', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Back</button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                  style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginLeft: 8, opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? 'Saving...' : 'Next'}
                </button>
              </div>
            )}
            {step === 4 && (
              <div>
                <StyledSelect label="Delivery Location" name="serviceLocation" value={form.serviceLocation} onChange={handleChange} required>
                  <option value="vijayawada">Vijayawada</option>
                </StyledSelect>
                <button type="button" onClick={prevStep} style={{ marginRight: 12, background: '#e3f0fc', color: '#1976d2', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Back</button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                  style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginLeft: 8, opacity: loading ? 0.6 : 1 }}
                >
                  {loading ? 'Saving...' : 'Next'}
                </button>
              </div>
            )}
            {step === 5 && (
              <div>
                <label style={{ display: 'block', marginBottom: 18 }}>
                  <input type="checkbox" name="termsAccepted" checked={form.termsAccepted} onChange={handleChange} required style={{ marginRight: 8 }} />
                  I accept the <a href="#" target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline' }}>terms and conditions</a>.
                </label>
                <button type="button" onClick={prevStep} style={{ marginRight: 12, background: '#e3f0fc', color: '#1976d2', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Back</button>
                <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Submit</button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default DeliveryPartnerReg;