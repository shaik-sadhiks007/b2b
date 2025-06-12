const mongoose = require('mongoose');

const menuTemplateSchema = new mongoose.Schema({
    menuName: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        
    },
    price: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MenuTemplate', menuTemplateSchema); 