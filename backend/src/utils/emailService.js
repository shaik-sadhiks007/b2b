const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports like 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const renderOrderItems = (items) =>
    items.map(item => `
        <li>${item.name || item.menuName} x ${item.quantity} - ₹${item.totalPrice || (item.price * item.quantity)}</li>
    `).join('');

const renderShippingDetails = (order) => {
    if (order.orderType === 'delivery' && order.customerAddress && typeof order.customerAddress === 'object') {
        // Delivery order with populated address
        return `
            <h3>Shipping Details:</h3>
            <p>Name: ${order.customerAddress.fullName}</p>
            <p>Phone: ${order.customerAddress.phone}</p>
            <p>Address: ${order.customerAddress.street}</p>
            <p>City: ${order.customerAddress.city}</p>
            <p>State: ${order.customerAddress.state}</p>
            <p>Pincode: ${order.customerAddress.zip}</p>
            <p>Country: ${order.customerAddress.country}</p>
        `;
    } else if (order.orderType === 'delivery' && order.shippingDetails) {
        // Fallback for legacy structure
        return `
            <h3>Shipping Details:</h3>
            <p>Name: ${order.shippingDetails.name}</p>
            <p>Phone: ${order.shippingDetails.phone}</p>
            <p>Address: ${order.shippingDetails.address}</p>
            <p>City: ${order.shippingDetails.city}</p>
            <p>State: ${order.shippingDetails.state}</p>
            <p>Pincode: ${order.shippingDetails.pincode}</p>
        `;
    } else {
        // Pickup order: no address
        return '';
    }
};

const sendOrderConfirmationEmail = async (email, order) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Order Confirmation - B2B App',
            html: `
                <h2>Thank you for your order!</h2>
                <p>Dear ${order.customerName || (order.shippingDetails && order.shippingDetails.name) || 'Customer'},</p>
                <p>Your order has been successfully placed. Here are your order details:</p>
                <h3>Order Type:</h3>
                <p>${order.orderType ? (order.orderType.charAt(0).toUpperCase() + order.orderType.slice(1)) : 'N/A'}</p>
                <h3>Order Items:</h3>
                <ul>
                    ${renderOrderItems(order.items)}
                </ul>
                ${renderShippingDetails(order)}
                <h3>Payment Method:</h3>
                <p>${order.paymentMethod}</p>
                <h3>Total Amount:</h3>
                <p>₹${order.totalAmount}</p>
                <p>We will process your order shortly.</p>
                <p>Thank you for choosing our service!</p>
            `
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

const sendStatusChangeEmail = async (email, order) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Order Status Update - ${order.newStatus || order.status}`,
            html: `
                <h2>Order Status Update</h2>
                <p>Dear ${order.customerName || (order.shippingDetails && order.shippingDetails.name) || 'Customer'},</p>
                <p>Your order status has been updated from <strong>${order.previousStatus}</strong> to <strong>${order.newStatus || order.status}</strong>.</p>
                <h3>Order Type:</h3>
                <p>${order.orderType ? (order.orderType.charAt(0).toUpperCase() + order.orderType.slice(1)) : 'N/A'}</p>
                <h3>Order Details:</h3>
                <p>Order ID: ${order.orderId || order._id}</p>
                <h3>Order Items:</h3>
                <ul>
                    ${renderOrderItems(order.items)}
                </ul>
                ${renderShippingDetails(order)}
                <h3>Payment Method:</h3>
                <p>${order.paymentMethod}</p>
                <h3>Total Amount:</h3>
                <p>₹${order.totalAmount}</p>
                <p>Thank you for choosing our service!</p>
            `
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Status change email sent successfully:', info.messageId);
    } catch (error) {
        console.error('Error sending status change email:', error);
        throw error;
    }
};

const testEmailConfiguration = async (testEmail) => {
    try {
        console.log('Email configuration:', {
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            user: process.env.EMAIL_USER,
            secure: false
        });

        const mailOptions = {
            from: `"B2B App" <${process.env.EMAIL_USER}>`,
            to: testEmail,
            subject: 'Email Configuration Test - B2B App',
            html: `
                <h2>Email Configuration Test</h2>
                <p>This is a test email to verify your email configuration.</p>
                <p>If you receive this email, your email service is working correctly.</p>
                <p>Sent at: ${new Date().toLocaleString()}</p>
                <p>From: ${process.env.EMAIL_USER}</p>
                <p>To: ${testEmail}</p>
            `,
            text: `Email Configuration Test\n\nThis is a test email to verify your email configuration.\nSent at: ${new Date().toLocaleString()}\nFrom: ${process.env.EMAIL_USER}\nTo: ${testEmail}`
        };
        
        console.log('Sending test email with options:', {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject
        });

        const info = await transporter.sendMail(mailOptions);
        console.log('Test email sent successfully:', info.messageId);
        console.log('Email response:', info);
        return { success: true, messageId: info.messageId, response: info };
    } catch (error) {
        console.error('Test email failed:', error);
        console.error('Error details:', {
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode
        });
        return { success: false, error: error.message, details: error };
    }
};

module.exports = {
    sendOrderConfirmationEmail,
    sendStatusChangeEmail,
    testEmailConfiguration
}; 