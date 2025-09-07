import mongoose from "mongoose";

const privateMessageSchema = new mongoose.Schema({
    from: {
        type: String,
        required: [true, "From is required"],
        trim: true
    },
    to: {
        type: String,
        required: [true, "To is required"],
        trim: true
    },
    message: {
        type: String,
        required: [true, "Message is required"],
        trim: true
    }
})

export const PrivateMessage = mongoose.model("PrivateMessage", privateMessageSchema)