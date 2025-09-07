// import inquirer from "inquirer";
// import { io } from "socket.io-client";
// import { EventEmitter } from "events";
// import readline from "readline";

// const socket = io("http://localhost:3000");
// const appEvents = new EventEmitter();
// let currentUser = null;

// // Helper: mesaj göstər
// function printMessage(message) {
//     // readline.clearLine(process.stdout, 0);      // Mövcud sətri sil
//     // readline.cursorTo(process.stdout, 0);       // Kursordan sətrin əvvəlinə get
//     // console.log(`\n${message}`);                // Mesajı yeni sətrdə göstər
//     // process.stdout.write("Mesaj yaz: ");        // Altına input üçün işarə qoy
//     console.log(`\n${message}`);
// }

// // Gələn mesajları göstər
// socket.on("privateMessage", (data) => {
//     // printMessage(`[${data.from}] > ${data.message}`);
//     printMessage(`[${data.from}] > ${data.message}`);

// });



// socket.on("groupMessage", (data) => {
//     // printMessage(`[Room:${data.room}] ${data.from}: ${data.message}`);
//     printMessage(`[Room:${data.room}] ${data.from}: ${data.message}`);

// });

// socket.on("userRegistered", ({ username }) => {
//     currentUser = username;
//     console.log(`✅ Welcome, ${username}`);
//     showMenu();
// });

// // Main menu
// appEvents.on("mainMenu", async () => {
//     const { username, password } = await inquirer.prompt([
//         { name: "username", message: "Enter your username:" },
//         { name: "password", message: "Enter your password:", type: "password", mask: "*" },
//     ]);
//     socket.emit("registerUser", { username, password });
// });

// // Başlanğıc menyusu
// function showMenu() {
//     inquirer
//         .prompt([
//             { type: "list", name: "action", message: "Please Choose from menu", choices: ["Private message", "Room message", "exit"] },
//         ])
//         .then((answers) => {
//             appEvents.emit(answers.action);
//         });
// }

// let lastRecipient = null; // Son mesaj göndərilən istifadəçi

// appEvents.on("Private message", async () => {
//     let toUsername = lastRecipient;

//     if (!toUsername) {
//         const response = await inquirer.prompt([
//             { name: "toUsername", message: "To Whom: " },
//         ]);
//         toUsername = response.toUsername;
//         lastRecipient = toUsername;
//     }

//     // Chat history-i gətir
//     socket.emit("getPrivateHistory", { withUser: toUsername });

//     socket.once("privateHistory", (messages) => {
//         messages.forEach(m => {
//             printMessage(`[${m.from}] > ${m.message}`);

//         });
//     });

//     // Mesaj yazmaq üçün dövr
//     while (true) {
//         const { msg } = await inquirer.prompt([
//             { name: "msg", message: "Write a message ('exit' to x):" },
//         ]);

//         if (msg.toLowerCase() === "x") break;

//         socket.emit("privateMessage", { from: currentUser, toUsername, message: msg });
//         printMessage(`[${currentUser}] > ${msg}`);
//     }
// });



// let joinedGroups = new Set(); // artıq qoşulduğun roomlar

// appEvents.on("Room message", async () => {
//     const { room } = await inquirer.prompt([
//         { name: "room", message: "Room Name:" },
//     ]);

//     // Əgər bu qrupa hələ qoşulmamısansa → qoşul
//     if (!joinedGroups.has(room)) {
//         socket.emit("joinRoom", room);
//         joinedGroups.add(room);
//     }

//     // Dövr: mesaj yazmaq üçün təkrar sorğu
//     while (true) {
//         const { msg } = await inquirer.prompt([
//             { name: "msg", message: `[${room}] Write a message ('exit' to x):` },
//         ]);

//         if (msg.toLowerCase() === "x") {
//             break; // dövrü bitir
//         }

//         socket.emit("groupMessage", { from: currentUser, room, message: msg });
//         printMessage(`[Room:${room}] ${currentUser}: ${msg}`);
//     }

//     // Dövr bitdikdən sonra menyuya qayıtmaq istəmirsənsə, heç nə çağırma
//     // Əgər istəsən, burada appEvents.emit("mainMenu") əlavə edə bilərsən
// });

// // Exit
// appEvents.on("x", () => {
//     console.log("You are out....");
//     process.exit(0);
// });

// // Start
// appEvents.emit("mainMenu");


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

// function printMessage(message) {
//     console.log(`\n${message}`);
// }

function printMessage(message) {
    process.stdout.clearLine(0);          // Cari sətri sil
    process.stdout.cursorTo(0);           // Kursoru sətrin əvvəlinə gətir
    console.log(`\n${message}`);          // Mesajı yeni sətrdə göstər
    // showPrompt();                         // Promptu yenidən göstər
}



// // Gələn mesajları göstər
// socket.on("privateMessage", (data) => {
//     printMessage(`[${data.from}] > ${data.message}`);
// });

// socket.on("groupMessage", (data) => {
//     printMessage(`[Room:${data.room}] ${data.from}: ${data.message}`);
// });

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


socket.on("userRegistered", ({ username }) => {
    currentUser = username;
    console.log(`✅ Welcome, ${username}`);
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
            // printMessage(`[${currentUser}] > ${msg}`);
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

// Start
rl.question("Enter your username: ", (username) => {
    rl.question("Enter your password: ", (password) => {
        socket.emit("registerUser", { username, password });
    });
});