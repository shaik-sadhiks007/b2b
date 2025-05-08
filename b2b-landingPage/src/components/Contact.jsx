import React, { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { openWindowWithToken } from '../utils/windowUtils';
//import React, { useState } from "react";
const ContactForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      phone: "",
      email: "",
      businessType: "",
      message: ""
    });
  
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    };
  
    const validateForm = () => {
      const { name, phone, email, businessType, message } = formData;
  
      if (!name || !phone || !email || !businessType || !message) {
        setError("All fields are required.");
        return false;
      }
  
      // Validate phone number (basic check for numeric value and length)
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone)) {
        setError("Please enter a valid 10-digit phone number.");
        return false;
      }
  
      // Validate email (basic email pattern)
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address.");
        return false;
      }
  
      return true;
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (validateForm()) {
        console.log("Submitted Data:", formData);
        setSubmitted(true);
        setError("");
        setFormData({ name: "", phone: "", email: "", businessType: "", message: "" });
      }
    };
  
    return (
      <div style={{ marginTop: "100px", display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: "100%",
            maxWidth: "600px",
            padding: "30px",
            border: "2px solid black",
            borderRadius: "10px",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)"
          }}
        >
          <h2
            style={{
              textAlign: "center",
              marginBottom: "20px",
              fontSize: "28px",
              fontWeight: "bold"
            }}
          >
            Contact Form
          </h2>
  
          {submitted && <p style={{ color: "green" }}>Form submitted successfully!</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
  
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontWeight: "bold" }}>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  border: "1px solid black",
                  borderRadius: "4px"
                }}
              />
            </div>
  
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontWeight: "bold" }}>Phone Number:</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  border: "1px solid black",
                  borderRadius: "4px"
                }}
              />
            </div>
  
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontWeight: "bold" }}>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  border: "1px solid black",
                  borderRadius: "4px"
                }}
              />
            </div>
  
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontWeight: "bold" }}>Business Type:</label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  border: "1px solid black",
                  borderRadius: "4px"
                }}
              >
                <option value="">Select Business Type</option>
                <option value="Retail">Retail</option>
                <option value="Services">Services</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Technology">Technology</option>
              </select>
            </div>
  
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontWeight: "bold" }}>Message:</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                  border: "1px solid black",
                  borderRadius: "4px",
                  height: "150px"
                }}
              />
            </div>
  
            <button
              type="submit"
              style={{
                padding: "10px",
                width: "100%",
                backgroundColor: "#333",
                color: "white",
                border: "none",
                borderRadius: "5px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    );
  };
  
  export default ContactForm;