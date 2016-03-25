
// objeto com os dados mais importantes (não persistentes)
var twitch = {
    name: 'Cogumelando',
    username: 'cogumelandooficial',
    streamTitle: 'LIVE',
    offAirTitle: 'OFF',
    offAirMessage: 'Off-air',
    notifySfx: '../assets/adanado.ogg'
};

// força a desativação do cache do ajax
$.ajaxSetup({cache:false});

// Método que inicializa os dados persistentes
function mythInit(){
    if(localStorage.length == 0){
        // cria os dados persistentes
        localStorage.setItem('persist',true);
        localStorage.setItem('sound',true);
        localStorage.setItem('notify',true);
        localStorage.setItem('interval',1);
        // notificação inicial
        var notificationId = "init";
        chrome.notifications.create(
            notificationId,
            {
                type:"basic",
                isClickable:true,
                iconUrl:"../assets/icon128.png",
                title:"Cogumelando",
                message:"Notificações estão ativadas, se quiser desativar entre nas opções."
            },function(){}
        );

        chrome.notifications.onClicked.addListener(function(notificationId){
            chrome.tabs.create({'url': '../pages/options.html'}, function(tab){/*callback*/});
        });
    }
}

// Método que se executa caso o request ajax tenha sucesso
// @twitchJson: o retorno do request ajax
function mythTwitch(twitchJson){
    // checa se está acontecendo uma live
    if(twitchJson.stream){ // live acontecendo
        // joga todos os dados da live nos dados persistentes
        localStorage.setItem('channel',JSON.stringify(twitchJson.stream));
        // cria um link para o nome do jogo
        twitch.game = twitchJson.stream.game;

        // faz uma checagem pra saber se no loop anterior já estava em live
        if(!localStorage.onStream){
            // muda o estado de live para true
            localStorage.setItem('onStream',true);

            // se as notificações estiverem ativadas
            if(localStorage.notify){
                var liveGame = twitch.game != null ? twitch.game : "live";

                var notificationId = "live";
                chrome.notifications.create(
                    notificationId,
                    {
                        type:"basic",
                        isClickable:true,
                        iconUrl:"../assets/icon128.png",
                        title:"ADANADO!!",
                        message:"É TEMPO! Começando "+liveGame+" ao vivo agora!"
                    },function(){}
                );

                chrome.notifications.onClicked.addListener(function(notificationId){
                    chrome.tabs.create({'url': 'http://www.twitch.tv/cogumelandooficial/'}, function(tab){/*callback*/});
                });

            }
            // se as notificações sonoras estiverem ativadas
            if (localStorage.sound) {
                // toca o ADANADO
                var notify = new Howl({
                    urls: [twitch.notifySfx]
                }).play();
            }
        }

        // altera as informações do botão
        chrome.browserAction.setBadgeBackgroundColor({color: "#0d0"}); // cor
        chrome.browserAction.setBadgeText({text:twitch.streamTitle}); // título
        chrome.browserAction.setTitle({title:twitch.name+' | '+twitch.game}); // tooltip

    }else{ // canal offline
        // altera o estado de stream pra offline
        localStorage.removeItem('onStream');
        // altera as informações do botão (parecido com o que está acima)
        chrome.browserAction.setBadgeBackgroundColor({color: "#d00"});
        chrome.browserAction.setBadgeText({text:twitch.offAirTitle});
        chrome.browserAction.setTitle({title:twitch.name+' | '+twitch.offAirMessage});

    }
}

// Método que faz o request ajax no canal do twitch
// @username: usuário do twitch
function getTwitch(username){
    $.ajax({
        url:'https://api.twitch.tv/kraken/streams/'+username,
        success:function(channel) {
            // método executado se o ajax tiver sucesso
            mythTwitch(channel);
        },
        error:function() {
            // método executado caso não tenha sucesso
            // isso pode acontecer caso esteja sem internet
            // ou alguma issue da extensão ou do navegador
            noConnect();
        }
    });
}

// Método que altera o botão para o caso do ajax falhar
function noConnect(){
    chrome.browserAction.setBadgeText({text:"..."});
    chrome.browserAction.setBadgeBackgroundColor({color: "#999"});
    chrome.browserAction.setTitle({title:twitch.name});
}
