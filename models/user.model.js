import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "UserName is required"],
        trim: true,
        unique: [true, "UserName is already taken"]
    },
    password: {
        type: String,
        required: true,
        minLength: [8, "password must be min 8 characters"]
    }
})


export const User = mongoose.model("User", userSchema)
