const mongoose = require("mongoose")
const Schema = mongoose.Schema

const UserSchema = new Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    confirmed: {
        type: Boolean,
        defaultValue: false
    },
    date: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken:{
        type: String
    },
    resetPasswordExpires: {
            type: Date
        }
})

module.exports = User = mongoose.model('users', UserSchema)