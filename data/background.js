
var twitch = {
    name: 'Cogumelando',
    username: 'cogumelandooficial',
    streamTitle: 'LIVE',
    offAirTitle: 'OFF',
    offAirMessage: 'Off-air'
}

chrome.runtime.onStartup.addListener(function () {
    localStorage.removeItem('onStream');
    if(localStorage.length == 0){
        localStorage.setItem('persist',true);
        localStorage.setItem('sound',true);
        localStorage.setItem('interval',1);
    }
    noConnect();
   // chrome.alarms.create("mainLoop", {delayInMinutes: 0.1,periodInMinutes: 1});
});
$.ajaxSetup({cache:false});

/*@deprecated
twitch.createLoop();
getTwitch(twitch.username);
twitch.mainLoop = setInterval(function(){
    getTwitch(twitch.username);
},twitch.ajaxInterval);
*/

//chrome.alarms.onAlarm.addListener(function(alarm) {
 //  getTwitch(twitch.username);
// });

function mythTwitch(twitchJson){
    twitch.channel = twitchJson;

    if(twitchJson.stream){
        localStorage.setItem('onStream',true);
        localStorage.setItem('channel',JSON.stringify(twitchJson.stream));
        
        chrome.browserAction.getBadgeText({},function(e){
            console.log(e);
            if(e != twitch.streamTitle && localStorage.sound){
                var notify = new Howl({
                    urls: ['adanado.ogg']
                }).play();
            }
        });
        
        twitch.game = twitchJson.stream.game;
        chrome.browserAction.setBadgeBackgroundColor({color: "#0d0"});
        chrome.browserAction.setBadgeText({text:twitch.streamTitle});
        chrome.browserAction.setTitle({title:twitch.name+' | '+twitch.game});

        console.log("Stream");

    }else{
        localStorage.removeItem('onStream');
        chrome.browserAction.setBadgeBackgroundColor({color: "#d00"});
        chrome.browserAction.setBadgeText({text:twitch.offAirTitle});
        chrome.browserAction.setTitle({title:twitch.name+' | '+twitch.offAirMessage});
        console.log("Off-air");
    }
}

function getTwitch(username){
    $.ajax({
        url:'https://api.twitch.tv/kraken/streams/'+username,
        success:function(channel) {
            console.log('Objeto recebido');
            mythTwitch(channel);
        },
        error:function() {
            console.log('Sem conexão');
            noConnect();
        }
    });
}

function noConnect(){
    chrome.browserAction.setBadgeText({text:"..."});
    chrome.browserAction.setBadgeBackgroundColor({color: "#999"});
    chrome.browserAction.setTitle({title:twitch.name});
}
