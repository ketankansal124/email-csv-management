const mongoose = require('mongoose');

const CustomPropertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    defaultValue: {
        type: String,
        required: true
    }
});

const ListSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    customProperties: [CustomPropertySchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const List = mongoose.model('List', ListSchema);

module.exports = List;
