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

const sendOrderConfirmationEmail = async (email, orderData) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Order Confirmation - Hotel App',
            html: `
                <h2>Thank you for your order!</h2>
                <p>Dear ${orderData.shippingDetails.name},</p>
                <p>Your order has been successfully placed. Here are your order details:</p>
                
                <h3>Order Items:</h3>
                <ul>
                    ${orderData.items.map(item => `
                        <li>${item.menuName} x ${item.quantity} - ₹${item.price * item.quantity}</li>
                    `).join('')}
                </ul>

                <h3>Shipping Details:</h3>
                <p>Name: ${orderData.shippingDetails.name}</p>
                <p>Phone: ${orderData.shippingDetails.phone}</p>
                <p>Address: ${orderData.shippingDetails.address}</p>
                <p>City: ${orderData.shippingDetails.city}</p>
                <p>State: ${orderData.shippingDetails.state}</p>
                <p>Pincode: ${orderData.shippingDetails.pincode}</p>

                <h3>Payment Method:</h3>
                <p>${orderData.paymentMethod}</p>

                <h3>Total Amount:</h3>
                <p>₹${orderData.totalAmount}</p>

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

module.exports = {
    sendOrderConfirmationEmail
}; 