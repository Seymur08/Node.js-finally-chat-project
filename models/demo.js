const EventEmitter = require('events');

const emitter = new EventEmitter();

// Dinləyici
emitter.on('giris', (user, password) => {
    if (user == "Seymur" && password == "sem1234")
        console.log(`${user} sistemə daxil oldu`);

    else {
        console.log(`${user} Siz sistemə yoxsunuz`);
    }
});


// Event-i işə salırıq
// emitter.emit('giris', 'Seymur');


const readline = require('readline');

// Interface yaradılır
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// İstifadəçidən məlumat almaq
rl.question('Adinizi daxil edin: ', (name) => {
    //console.log(`Salam, ${ad}!`);
    rl.question("Sifrenizi daxil edin: ", (password) => {
        emitter.emit('giris', `${name}`, `${password}`);
        rl.close();

    })
    // readline bağlanmalıdır
});
