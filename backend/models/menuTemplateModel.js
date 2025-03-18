const mongoose = require('mongoose');

const menuTemplateSchema = new mongoose.Schema({
    menuName: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    // category: {
    //     type: String,
    //     required: true,
    //     enum: ['breakfast', 'lunch', 'dinner', 'snacks']
    // }
}, {
    timestamps: true
});

module.exports = mongoose.model('MenuTemplate', menuTemplateSchema); 