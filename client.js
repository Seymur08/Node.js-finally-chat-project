import { io } from "socket.io-client";
import { EventEmitter } from "events";
import readline from "readline";

const socket = io("http://localhost:3000");
const appEvents = new EventEmitter();
let currentUser = null;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function printMessage(message) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    console.log(`\n${message}`);
}


socket.on("privateMessage", (data) => {
    if (data.from !== currentUser) {
        printMessage(`[${data.from}] > ${data.message}`);
    }
});

socket.on("roomMessage", (data) => {
    if (data.from !== currentUser) {
        printMessage(`[Room:${data.room}] ${data.from}: ${data.message}`);
    }
});


socket.on("userRegistered", ({ username, isNew }) => {

    currentUser = username;
    if (isNew) {
        console.log(`✅Create new user: ${username}!`);
    } else {
        console.log(`✅ Welcome, ${username}!`);
    }
    showMenu();
});

appEvents.on("mainMenu", () => {
    console.log("\n📋 Menu:");
    console.log("1. Private message");
    console.log("2. Room message");
    console.log("3. Exit");

    rl.question("Choose option (1/2/3): ", (choice) => {
        switch (choice.trim()) {
            case "1":
                appEvents.emit("Private message");
                break;
            case "2":
                appEvents.emit("Room message");
                break;
            case "3":
                appEvents.emit("x");
                break;
            default:
                console.log("❌ Invalid choice");
                appEvents.emit("mainMenu");
        }
    });
});

function showMenu() {
    appEvents.emit("mainMenu");
}

let lastRecipient = null;

appEvents.on("Private message", () => {
    if (!lastRecipient) {
        rl.question("To Whom: ", (to) => {
            lastRecipient = to;
            startPrivateChat(to);
        });
    } else {
        startPrivateChat(lastRecipient);
    }
});

function startPrivateChat(toUsername) {
    socket.emit("getPrivateHistory", { withUser: toUsername });

    socket.once("privateHistory", (messages) => {
        messages.forEach(m => {
            printMessage(`[${m.from}] > ${m.message}`);
        });
        promptPrivateMessage(toUsername);
    });
}

function promptPrivateMessage(toUsername) {
    rl.question("Write a message ('exit' to x): ", (msg) => {
        if (msg.toLowerCase() === "x") {
            appEvents.emit("mainMenu");
        } else {
            socket.emit("privateMessage", { from: currentUser, toUsername, message: msg });
            promptPrivateMessage(toUsername);
        }
    });
}

let joinedGroups = new Set();

appEvents.on("Room message", () => {
    rl.question("Room Name: ", (room) => {
        if (!joinedGroups.has(room)) {
            socket.emit("joinRoom", room);
            joinedGroups.add(room);
        }
        promptRoomMessage(room);
    });
});

function promptRoomMessage(room) {
    rl.question(`[${room}] Write a message ('exit' to x): `, (msg) => {
        if (msg.toLowerCase() === "x") {
            appEvents.emit("mainMenu");
        } else {
            socket.emit("roomMessage", { from: currentUser, room, message: msg });
            printMessage(`[Room:${room}] ${currentUser}: ${msg}`);
            promptRoomMessage(room);
        }
    });
}

appEvents.on("x", () => {
    console.log("You are out....");
    rl.close();
    process.exit(0);
});

rl.question("Enter your username: ", (username) => {
    rl.question("Enter your password: ", (password) => {
        socket.emit("registerUser", { username, password });
    });
});