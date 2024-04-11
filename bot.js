const firebase = require('./firebase');
const getGames = require('./steam.js');
const getGameName = require('./steam.js');
const Discord = require('discord.js');
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_MESSAGES] });
const keys = require('./keys')
client.login(keys.DiscordAPIKey);




const db = firebase.firestore();

const SteamAPI = require('steamapi');
const steam = new SteamAPI(keys.SteamAPIKey);

const prefix = '*';
var playerId;


const queue = new Map();




// ------------------------------------------------------------------------------------- JOGOS
async function getDoc(reason, collection, userName)  {
    const user = db.collection(collection).doc(userName);
        const doc = await user.get();
        if (!doc.exists) {
            console.log('No such document!');
        }
        else if(reason === 'updateJogos'){
            playerId = doc.data().steamId;
            getGames(playerId, userName);
        }
        else if(reason === 'numeroJogos'){
            return doc.data().numeroJogos;
            
        }
        else if(reason === 'listaJogos'){
            return doc.data().jogos;
            
        }
        else if(reason === 'animeInfo'){
            return doc.data();
        }
        else {
            console.log('Document data:', doc.data());
        }
}

async function serachSmallest(args){
    var smallerListOwner = args[0];
        for (i = 1 ; i <= args.length - 1; i++ ){
            if (await getDoc("numeroJogos", "users", smallerListOwner) >= await getDoc("numeroJogos", "users", args[i])){
                smallerListOwner = args[i];
                
            }
        }
    return smallerListOwner;
}

async function findMatches(args, smallestUser){
    var matchGames = await getDoc("listaJogos", "users", smallestUser);
    var newMatchGames = [];
    var searchingList = await getDoc("listaJogos", "users", args[0]);
    var game;


    for (i = 0 ; i <= args.length - 1; i++ ){

        searchingList = await getDoc("listaJogos", "users", args[i]);

        for(b = 0 ; b < matchGames.length ; b++){

            game = matchGames[b];

            for(y = 0 ; y < searchingList.length ; y++){
                if (searchingList[y] === game ){
                    newMatchGames.push(searchingList[y]);
                }
            }
            
        }
        matchGames = newMatchGames;
        newMatchGames = [];

    }
    return matchGames;
}


async function translateGames(appIdList){
    var names = [];
    for(i = 0 ; i < appIdList.length ; i++){
        await steam.getGameDetails(appIdList[i]).then(details => names.push(details.name)).catch(e=>{console.log(e)});
        
    }
    
    return names;
}

async function pushNewEpisode(anime,episode,link){
    var animeData = await db.collection('animes').doc(anime).get();
    var today = new Date();
    var newData = {
        watchedToday: parseInt(episode) - animeData.data().epAtual,
        date: today,
    }
    await db.collection('animes').doc(anime).set({ dates : (animeData.data().dates.concat([newData]))}, {merge: true})
    .catch(e => {
        console.log(e);  
    });
    await db.collection('animes').doc(anime).update({epAtual: parseInt(episode), link: link}).then(()=>{
    }).catch(e => {
        console.log(e);
        
    });
    
}
// ------------------------------------------------------------------------------------- JOGOS



// ------------------------------------------------------------------------------------- ACTIONS
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});



client.on('message', msg  => {

    if (!msg.content.startsWith(prefix) || msg.author.bot) return;

    const args = msg.content.slice(prefix.length).trim().split(' ').filter(e => e);
    const command = args.shift().toLowerCase();
    const serverQueue = queue.get(msg.guild.id);


    if (command === "update-jogos") {
        msg.reply('Buscando os jogos de ' + args[0] );
        getDoc("updateJogos", "users", args[0]);
        msg.reply('Lista de jogos de ' + args[0] +' atualizada!');
        
    }

    else if (command === "comparar"){
        msg.react('👌');
        serachSmallest(args).then(smallestUser => {
            findMatches(args, smallestUser).then(appIdList => {
                msg.reply('vocês têm '+ (appIdList.length) +' jogos em comum! Vou buscar os nomes um min');
                translateGames(appIdList).then(translatedGames=>{
                    var mentionsMessage = "Jogos em comum de " + args[0] ;
                    for (i = 1 ; i < args.length - 1 ; i++ ) {
                        mentionsMessage += ", "
                        mentionsMessage += args[i];
                    }
                    mentionsMessage += " e " + args[args.length-1] + " :";
                    msg.channel.send(mentionsMessage);
                    msg.channel.send(translatedGames);
                    
                }) 
            })
        });
        

    }
    

    else if (command === "cadastrar"){
        msg.react('👌');
        steam.get('/IPlayerService/GetOwnedGames/v0001?steamid=' + args[1],' http://api.steampowered.com',keys.SteamAPIKey).then(()=>{
            console.log(args);
            db.collection('users').doc(args[0]).set({
                steamId: args[1]
            }).then(() => {
                msg.reply("Usuario cadastrado com sucesso");
            }).catch(() => {
                msg.reply("Erro: nao foi possivel cadastrar");
            })
            getDoc("updateJogos", "users", args[0]);
        }).catch(() => {
            msg.reply("Erro: codigo de Id invalido");
        });
        
    }

    else if (command === "bomdia"){
        msg.react('🌞');
        msg.reply("BOM DIA FLOR DO DIA!!!!!!"); 
    }

    else if (command === "update-anime"){
        if(args[1] === "episodio"){
            msg.react('👌');
            pushNewEpisode(args[0],args[2],args[3]).then(() => {
                msg.reply("episodio atual do anime " + args[0] + " atualizado com sucesso");
                
            })
            .catch(()=> {
                msg.reply("Erro ao atualizar episodios");
            });
        }
        
        
    }

    else if (command === "cadastrar-anime"){
        msg.guild.roles.create({
            data: {
                name: args[0],
            }
        }).then((role) =>{
            db.collection('animes').doc(("<@&"+role.id+">")).set({
                nome: args[0],
                dates: [],
                epAtual: args[1]
            }).then(() => {
                msg.reply("Anime cadastrado com sucesso");
            }).catch(() => {
                msg.reply("Erro: nao foi possivel cadastrar");
            })
        }).catch(() => {
            msg.reply("Erro: nao foi possivel criar o cargo");
        });
        
        
        
    }

    else if (command === "anime"){
        msg.react('👌');
        getDoc("animeInfo", "animes", args[0]).then(animeInfo => {
            msg.reply("busquei as informacoes sobre " + args[0] + "\n Episodio atual: " + animeInfo.epAtual);
            msg.reply("Toma o link meu mano " + animeInfo.link);
        });
        

    }

    else if (msg.content.startsWith(`${prefix}play`)) {
        execute(msg, serverQueue);
        return;
    } 
    
    else if (msg.content.startsWith(`${prefix}skip`)) {
        skip(msg, serverQueue);
        return;
    } 
    
    else if (msg.content.startsWith(`${prefix}stop`)) {
        stop(msg, serverQueue);
        return;
    }
    
    else if (command === 'help'){
        if (!args.length){
            msg.reply('funções disponíveis: bomdia, cadastrar, comparar, update-jogos, update-anime');
        }
        else if (args[0] === ("bomdia")){
            msg.reply('da um feliz bom dia para quem deu o comando \n Uso: *bomdia');
        }
        else if (args[0] === ("cadastrar")){
            msg.reply('cadastra um novo usuario no sistema, possibilitando comparar os jogos \n Uso: *cadastrar {mencao Discord} {Id na Steam}');
        }
        else if (args[0] === ("comparar")){
            msg.reply('compara a lista de dois ou mais usuarios, dando como resultado os jogos em comum \n Uso: *comparar {mencao Usuario 1} {mencao Usuario 2} ... {mencao Usuario n}');
        }
        else if (args[0] === ("update-jogos")){
            msg.reply('atualiza os jogos possuidos de um usuario \n Uso: *update-jogos {mencao Discord}');
        }
        else if (args[0] === ("update-anime")){
            msg.reply('atualiza de acordo com o pedido o anime mencionado \n Uso: *update-anime {Anime} {episodio} {Numero do episodio}');
        }
        
    }
});




