const keys = require('./keys')

const firebase = require('./firebase');
const db = firebase.firestore();

const SteamAPI = require('steamapi');
const steam = new SteamAPI(keys.SteamAPIKey);

async function getGameName(appIdList) {
    var names = [];
    for(i = 0 ; i < appIdList.length ; i++){
        await steam.getGameDetails(appIdList[i]).then(details => names.push(details.name)).catch(e=>{console.log(e)});
    }
    
    return names;
}   


async function getGames(playerId, userName) {
    steam.get('/IPlayerService/GetOwnedGames/v0001?steamid=' + playerId,' http://api.steampowered.com', keys.SteamAPIKey)
    .then(apps => {
        const appsListRaw = apps.response.games;
        var appsList = [];
        for(var i = 0 ; i<apps.response.game_count ; i++ ){
            appsList.push(appsListRaw[i].appid);
        }
        db.collection('users').doc(userName).update({numeroJogos: apps.response.game_count});
        db.collection('users').doc(userName).update({jogos: appsList});
        console.log(apps);

    }).catch(e => console.log('Error: ' + e));

}



module.exports = getGames, getGameName;