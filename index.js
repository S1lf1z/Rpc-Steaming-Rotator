const fs = require('fs');
const readline = require('readline');
const { Client, RichPresence } = require('discord.js-selfbot-v13');
const keepAlive = require('./server.js');
const request = require('request');
const notifier = require('node-notifier');

keepAlive();


const client = new Client({
  checkUpdate: false,
});


const tumadre = [

    'PFP/GIG-AQUI',
    'PFP/GIG-AQUI',
    'PFP/GIG-AQUI',

];

const troll = [

    'PFP/GIG-AQUI',
    'PFP/GIG-AQUI',
    'PFP/GIT-AQUI',
];

let afkStatus = {
    active: false,
    message: 'AFK',
};

function createConfigFile(token) {
    const configData = {
        token: token
    };
    fs.writeFileSync('./config.json', JSON.stringify(configData, null, 4));
}

function getTokenFromUserInput() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve, reject) => {
        rl.question('Enter your Discord token: ', (token) => {
            rl.close();
            resolve(token.trim());
        });
    });
}

async function initializeBot() {
    let token;
    try {
        fs.accessSync('./config.json');
        const config = require('./config.json');
        if (config.token) {
            token = config.token;
        } else {
            throw new Error('Token is missing in config.json');
        }
    } catch (error) {
        if (error.code === 'ENOENT' || error.message === 'Token is missing in config.json') {
            console.log('config.json not found or token is missing. Creating...');
            token = await getTokenFromUserInput();
            createConfigFile(token);
            sendToStreamingPresence(token);
        } else {
            console.error('Error accessing config.json:', error);
            process.exit(1);
        }
    }

    client.on('messageCreate', async message => {
        if (afkStatus.active && message.author.id !== client.user.id) {
            if (message.channel.type === 'DM') {
                message.reply(afkStatus.message);

            }
        }

        if (message.content.startsWith('$')) {
            const args = message.content.slice(1).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            if (command === 'afk') {
                if (args.length === 0) {
                    message.reply('Estoy Afk Mi self Bot Te Responde');
                    const response = await message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: 30000 });
                    const responseContent = response.first().content.toLowerCase();
                    if (responseContent === 'si') {
                        message.reply('Escribe la razón para tu AFK:');
                        const reasonResponse = await message.channel.awaitMessages(m => m.author.id === message.author.id, { max: 1, time: 30000 });
                        afkStatus.message = reasonResponse.first().content;
                        reasonResponse.first().delete();
                    } else if (responseContent === 'no') {
                        afkStatus.message = 'Estoy afk';
                    } else {
                        message.reply('Respuesta inválida. Debes responder con "Si" o "No".');
                        return;
                    }
                    afkStatus.active = true;
                    console.log(`AFK activado con mensaje: ${afkStatus.message}`);
                    notifier.notify({
                        title: 'AFK Activado',
                        message: `Mensaje: ${afkStatus.message}`,
                        icon: 'info',
                    });
                    message.delete();
                } else {
                    afkStatus.message = args.join('');
                    afkStatus.active = true;
                    console.log(`AFK activado con mensaje: ${afkStatus.message}`);
                    notifier.notify({
                        title: 'AFK Activado',
                        message: `Mensaje: ${afkStatus.message}`,
                        icon: 'info',
                    });
                    message.delete();
                }
            } else if (command === 'afkoff' || command === 'afk off') {
                afkStatus.active = false;
                afkStatus.message = 'Estoy afk';
                console.log('AFK desactivado');
                notifier.notify({
                    title: 'AFK System',
                    message: 'El Afk se encuentra desactivado',
                    icon: 'info',
                });
                message.delete();
            }

        }
    });


    client.once('ready', () => {
        console.clear();
        console.log(`Ready, your selfbot is ready in this account ${client.user.tag} | by: young`);
        console.log(`Yeah Yeah`);

        const names = [
             'NAME RPC AQUI',
             'OTRO AQUI',
        ];
        let currentIndex = 0;
        let currentImageIndex = 0;


        function readStatusesFromFile(filePath) {
            const statuses = fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean);
            return statuses;
        }


        function readEmojisFromFile(filePath) {
            const emojis = fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean).map(line => {
                if (line.includes(':')) {

                    const [name, id] = line.split(':');
                    return { name, id: id || null };
                } else {

                    return line.trim();
                }
            });

            console.log(`Emojis cargados vinculados con ${filePath} correctamente`);

            return emojis;
        }



        function change_status(token, status, emoji_name = '', emoji_id = null) {
            const options = {
                url: "https://discord.com/api/v10/users/@me/settings",
                headers: {
                    'Authorization': token
                },
                json: true,
                body: {
                    custom_status: {
                        text: status,
                        emoji_name: emoji_name !== '' ? emoji_name : null,
                        emoji_id: emoji_id
                    }
                }
            };

            request.patch(options, (error, response, body) => {
                if (error) {
                    console.error('Error', error);
                }
            });
        }

        async function changeStatusAndEmojisPeriodically(token) {
            const statuses = readStatusesFromFile('text.txt');
            const emojis = readEmojisFromFile('emojis.txt');

            let statusIndex = 0;
            let emojiIndex = 0;

            while (true) {
                let status = statuses[statusIndex];
                let emoji_name = '';
                let emoji_id = null;

                if (status.includes('emoji:')) {
                    const emojiDefinition = status.split('emoji:')[1].trim();
                    const emojiParts = emojiDefinition.split(':');
                    emoji_name = emojiParts[0];
                    emoji_id = emojiParts[1] || null;

                    status = status.split('emoji:')[0].trim();
                } else {
                    const currentEmoji = emojis[emojiIndex % emojis.length];
                    emoji_name = currentEmoji.name;
                    emoji_id = currentEmoji.id;
                }

                change_status(token, status, emoji_name, emoji_id);

                statusIndex = (statusIndex + 1) % statuses.length;
                emojiIndex = (emojiIndex + 1) % emojis.length;

                await new Promise(resolve => setTimeout(resolve, 15000));
            }
        }
        function updatePresence() {
            const real = new RichPresence(client)
                .setApplicationId('ID DE TU APP AQUI')
                .setType('STREAMING')
                .setURL('https://twitch.tv/nt')
                .setState('OTRO AQUI')
                .addButton('RPC AQUI', 'LINK AQUI')
                .addButton('RPC 2 AQUI', 'LINK AQUI')
                .setAssetsSmallImage(troll[currentImageIndex])
                .setAssetsLargeImage(tumadre[currentImageIndex])

            real
                .setName(names[currentIndex])
                .setDetails(names[currentIndex]);

            currentIndex = (currentIndex + 1) % names.length;
            currentImageIndex = (currentImageIndex + 1) % troll.length;

            client.user.setPresence({ activities: [real], status: "dnd" });
        }

        updatePresence();

        setInterval(updatePresence, 2500);

        changeStatusAndEmojisPeriodically(token);
    });

    client.login(token).catch(error => {
        console.error(`Error logging in: ${error.message}`);
    });
}

initializeBot();
