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

const usersMap = new Map(); // username → socket.id

io.on("connection", (socket) => {
    console.log("connected new user", socket.id);

    // Qeydiyyat
    socket.on("registerUser", async ({ username, password }) => {
        let user = await User.findOne({ username });
        if (!user) {
            user = await User.create({ username, password });
            console.log("Create new user:", username);
        }
        socket.username = username; // ← burda təyin et
        usersMap.set(username, socket.id);
        socket.emit("userRegistered", { username, id: socket.id });
    });

    socket.on("privateMessage", async ({ toUsername, message, from }) => {
        const targetSocketId = usersMap.get(toUsername);
        if (targetSocketId) {
            // Qarşı tərəfə mesaj göndər
            io.to(targetSocketId).emit("privateMessage", { from, message });

            // Göndərənə də mesajı geri göndər
            socket.emit("privateMessage", { from, message });

            // DB-yə yaz
            await PrivateMessage.create({ from, to: toUsername, message });
        } else {
            console.log("User not find:", toUsername);
        }
    });

    // Chat history-i çəkmək
    socket.on("getPrivateHistory", async ({ withUser }) => {
        const messages = await PrivateMessage.find({
            $or: [
                { from: socket.username, to: withUser },
                { from: withUser, to: socket.username }
            ]
        }).sort({ _id: 1 }); // köhnədən yeniyə

        socket.emit("privateHistory", messages);
    });

    // Qrup mesajı
    socket.on("joinRoom", (room) => {
        socket.join(room);
    });

    socket.on("roomMessage", async ({ room, message, from }) => {
        io.to(room).emit("roomMessage", { from, room, message });

        // DB-yə yaz
        await RoomMessage.create({ from, room, message });
    });

    // Disconnect
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