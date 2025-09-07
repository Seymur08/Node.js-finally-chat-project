import mongoose from "mongoose";

const roomMessageSchema = new mongoose.Schema({
    room: {
        type: String,
        required: [true, "Room name is required"],
        trim: true,
        unique: [true, "Room name is already taken"]
    },
    from: {
        type: String,
        required: [true, "From name is required"],
        trim: true,
    },
    message: {
        type: String,
        required: [true, "Message name is required"],
        trim: true,
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
})

export const RoomMessage = mongoose.model("RoomMessage", roomMessageSchema)