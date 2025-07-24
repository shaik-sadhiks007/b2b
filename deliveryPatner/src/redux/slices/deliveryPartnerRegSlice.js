import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { registerDeliveryPartnerApi, updateDeliveryPartnerStepApi, getDeliveryPartnerProfileApi } from '../../api/Api';

// Utility: convert File to base64 string
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Utility: sanitize form for backend
async function sanitizeForm(form) {
  const sanitized = { ...form };
  // Photo
  if (sanitized.photo && typeof sanitized.photo === 'object') {
    sanitized.photo = await fileToBase64(sanitized.photo);
  } else if (!sanitized.photo || typeof sanitized.photo !== 'string') {
    sanitized.photo = null;
  }
  // Aadhaar
  sanitized.aadhaar = { ...sanitized.aadhaar };
  if (sanitized.aadhaar.front && typeof sanitized.aadhaar.front === 'object') {
    sanitized.aadhaar.front = await fileToBase64(sanitized.aadhaar.front);
  } else if (!sanitized.aadhaar.front || typeof sanitized.aadhaar.front !== 'string') {
    sanitized.aadhaar.front = null;
  }
  if (sanitized.aadhaar.back && typeof sanitized.aadhaar.back === 'object') {
    sanitized.aadhaar.back = await fileToBase64(sanitized.aadhaar.back);
  } else if (!sanitized.aadhaar.back || typeof sanitized.aadhaar.back !== 'string') {
    sanitized.aadhaar.back = null;
  }
  return sanitized;
}

export const registerDeliveryPartner = createAsyncThunk(
  'deliveryPartnerReg/register',
  async (form, { rejectWithValue }) => {
    try {
      const sanitized = await sanitizeForm(form);
      const res = await registerDeliveryPartnerApi({ ...sanitized, step: 1 });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Registration failed');
    }
  }
);

export const updateDeliveryPartnerStep = createAsyncThunk(
  'deliveryPartnerReg/updateStep',
  async ({ id, form, step }, { rejectWithValue }) => {
    try {
      const sanitized = await sanitizeForm(form);
      const res = await updateDeliveryPartnerStepApi(id, { ...sanitized, step });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Update failed');
    }
  }
);

export const getDeliveryPartnerProfile = createAsyncThunk(
  'deliveryPartnerReg/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getDeliveryPartnerProfileApi();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Profile fetch failed');
    }
  }
);

const initialState = {
  step: 1,
  form: {
    name: '',
    gender: '',
    vehicleNumber: '',
    vehicleType: '',
    mobileNumber: '',
    photo: null,
    aadhaar: {
      front: null,
      back: null,
    },
    presentAddress: {
      streetAddress: '',
      pinCode: '',
      city: '',
      district: '',
      state: 'Andhra Pradesh',
      country: 'India',
    },
    serviceLocation: 'vijayawada',
    termsAccepted: false,
    online: false,
    status: 'pending',
  },
  id: null,
  loading: false,
  error: null,
};

const deliveryPartnerRegSlice = createSlice({
  name: 'deliveryPartnerReg',
  initialState,
  reducers: {
    setFormField: (state, { payload }) => {
      // Ensure cleared images are set to null, not {}
      if ('photo' in payload && (!payload.photo || typeof payload.photo === 'object')) {
        state.form.photo = payload.photo || null;
      }
      if ('aadhaar' in payload) {
        state.form.aadhaar = {
          ...state.form.aadhaar,
          ...Object.fromEntries(
            Object.entries(payload.aadhaar).map(([k, v]) => [k, v || null])
          ),
        };
      }
      // Other fields
      Object.entries(payload).forEach(([k, v]) => {
        if (k !== 'photo' && k !== 'aadhaar') {
          state.form[k] = v;
        }
      });
    },
    setStep: (state, { payload }) => {
      state.step = payload;
    },
    resetForm: (state) => {
      state.form = initialState.form;
      state.step = 1;
      state.id = null;
      state.loading = false;
      state.error = null;
    },
    setAllFields: (state, { payload }) => {
      // Only hydrate with strings or null for images
      state.form = {
        ...state.form,
        ...payload.form,
        photo: typeof payload.form.photo === 'string' ? payload.form.photo : null,
        aadhaar: {
          front: payload.form.aadhaar && typeof payload.form.aadhaar.front === 'string' ? payload.form.aadhaar.front : null,
          back: payload.form.aadhaar && typeof payload.form.aadhaar.back === 'string' ? payload.form.aadhaar.back : null,
        },
      };
      state.id = payload.id;
      state.step = payload.step;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerDeliveryPartner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerDeliveryPartner.fulfilled, (state, action) => {
        state.loading = false;
        state.id = action.payload._id;
        state.step = action.payload.step;
      })
      .addCase(registerDeliveryPartner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateDeliveryPartnerStep.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDeliveryPartnerStep.fulfilled, (state, action) => {
        state.loading = false;
        state.step = action.payload.step;
      })
      .addCase(updateDeliveryPartnerStep.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getDeliveryPartnerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDeliveryPartnerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.id = action.payload._id;
        state.form = {
          ...state.form,
          ...action.payload,
          photo: typeof action.payload.photo === 'string' ? action.payload.photo : null,
          aadhaar: {
            front: action.payload.aadhaar && typeof action.payload.aadhaar.front === 'string' ? action.payload.aadhaar.front : null,
            back: action.payload.aadhaar && typeof action.payload.aadhaar.back === 'string' ? action.payload.aadhaar.back : null,
          },
        };
        state.step = action.payload.step || 1;
      })
      .addCase(getDeliveryPartnerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFormField, setStep, resetForm, setAllFields } = deliveryPartnerRegSlice.actions;
export default deliveryPartnerRegSlice.reducer; 