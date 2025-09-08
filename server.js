import express from "express";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./index.js";
import { User } from "./models/user.model.js";
import { PrivateMessage } from "./models/privateMessage.message.model.js";
import { RoomMessage } from "./models/roomMessage.model.js";

const app = express();
connectDB();

const server = http.createServer(app);
const io = new Server(server);

const usersMap = new Map();

io.on("connection", (socket) => {
    console.log("connected new user", socket.id);


    socket.on("registerUser", async ({ username, password }) => {
        let user = await User.findOne({ username });
        let isNew = false;

        if (!user) {
            user = await User.create({ username, password });
            console.log("Create new user:", username);
            isNew = true;
        }

        socket.username = username;
        usersMap.set(username, socket.id);

        socket.emit("userRegistered", { username, id: socket.id, isNew });


    });

    socket.on("privateMessage", async ({ toUsername, message, from }) => {
        const targetSocketId = usersMap.get(toUsername);
        if (targetSocketId) {
            io.to(targetSocketId).emit("privateMessage", { from, message });

            socket.emit("privateMessage", { from, message });

            await PrivateMessage.create({ from, to: toUsername, message });
        } else {
            console.log("User not find:", toUsername);
        }
    });

    socket.on("getPrivateHistory", async ({ withUser }) => {
        const messages = await PrivateMessage.find({
            $or: [
                { from: socket.username, to: withUser },
                { from: withUser, to: socket.username }
            ]
        }).sort({ _id: 1 });

        socket.emit("privateHistory", messages);
    });

    socket.on("joinRoom", (room) => {
        socket.join(room);
    });

    socket.on("roomMessage", async ({ room, message, from }) => {
        io.to(room).emit("roomMessage", { from, room, message });

        // await RoomMessage.create({ from, room, message });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        for (const [username, id] of usersMap.entries()) {
            if (id === socket.id) {
                usersMap.delete(username);
                break;
            }
        }
    });
});

server.listen(3000, () => {
    console.log("working server: http://localhost:3000");
});