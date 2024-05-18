const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    listId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'List',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true 
    },
    customProperties: { type: Map, of: String },
    isUnsubscribed: {
        type: Boolean,
        default: false 
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

UserSchema.index({ listId: 1, email: 1 }, { unique: true }); // Ensures unique email per list

const User = mongoose.model('User', UserSchema);

module.exports = User;
