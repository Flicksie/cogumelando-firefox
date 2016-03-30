var { setInterval, clearInterval } = require("sdk/timers");
var { ToggleButton } = require('sdk/ui/button/toggle');
var notifications = require("sdk/notifications");
var persistent = require("sdk/simple-storage");
var panels = require("sdk/panel");
var self = require("sdk/self");
var tabs = require("sdk/tabs");

// objeto com os dados mais importantes (não persistentes)
var twitch = {
    name: 'Cogumelando',
    username: 'cogumelandooficial',
    streamTitle: ' ',
    offAirTitle: 'OFF',
    offAirMessage: 'Aguarde e Xonfie',
    notifySfx: '../assets/adanado.ogg'
};

var configs = {
    badgeLabel: twitch.name+' 🔁',
    mainLoop: undefined
};

// Storage do twitch. Simbólico por enquanto
persistent.storage.twitch = twitch;

setPersistent('streaming', false);

if (persistent.storage.notify === undefined) {
    setPersistent('notify', true);
}
if (persistent.storage.sound === undefined) {
    setPersistent('sound', true);
}
if (persistent.storage.interval === undefined) {
    setPersistent('interval', 1);
}
if (persistent.storage.installed === undefined) {
    liveNotify(
        "Notificações estão ativadas, se quiser desativar entre nas opções.",
        "options"
    );
    setPersistent('installed', true);
}

var button = ToggleButton({
  id: "cogux",
  label: configs.badgeLabel,
  icon: {
    "24": "./icon-24.png",
    "32": "./icon-32.png",
    "48": "./icon-48.png"
  },
  onChange: handleChange,
  badge: "...",
  badgeColor: "rgba(153, 153, 153, 0.46)"
});

var panel = panels.Panel({
    contentURL: self.data.url("pages/panel.html"),
    contentScriptFile: [
        self.data.url("scripts/jquery.min.js"),
        self.data.url("scripts/img_loader.min.js"),
        self.data.url("scripts/howler.min.js"),
        self.data.url("scripts/panel-controller.js")
    ],
    onHide: handleHide,
    width: 320,
    height: 210
});

function handleChange(state) {
    if (state.checked) {
        panel.show({
            position: button
        });
        panel.port.emit('open', persistent.storage, twitch);
    }
}

function handleHide() {
    button.state('window', {
        checked: false,
        label: configs.badgeLabel
    });
}

function setPersistent(name, value) {
    persistent.storage[name] = value;
}

function getPersistent(name) {
    return persistent.storage[name];
}

function liveNotify(msg, url) {
    notifications.notify({
        title: "Cogumelando",
        text: msg,
        iconURL: self.data.url("icon128.png"),
        data: url,
        onClick: function (data) {
            if (data === 'options') {
                showOptions('pages/options.html');
            }else {
                tabs.open(data);
            }
        }
    });
}

function showOptions(_url){
    tabs.open({
        url: _url,
        onReady: function(tab) {
            var options = tab.attach({
                contentScriptFile: self.data.url("scripts/options-controller.js")
            });
            options.port.on("html", function(message) {
                console.log(message);
            });
        }
    });
}

function setBadgeStatus(label, txt, color){
    configs.badgeLabel = label;
    button.state('window', {"label" : label});
    button.badge = txt;
    button.badgeColor = color;
}

function setBadgeIdle() {
    setBadgeStatus(twitch.name+' 🔁', '...', 'rgba(153,153,153,0.46)');
}

function setBadgeStream(game) {
    var label = twitch.name+' 🎮 ';
    if(game) label += game;
    setBadgeStatus(label, twitch.streamTitle, 'rgba(0,221,0,0.46)');
}

function setBadgeOff() {
    setBadgeStatus(twitch.name+' ☕ '+twitch.offAirMessage, twitch.offAirTitle, 'rgba(221,0,0,0.46)');
}

function setMainInterval(min) {
    if (configs.mainLoop) {
        clearInterval(configs.mainLoop);
    }
    configs.mainLoop = setInterval(mainLoop, min * 60000);
}

// Intervalos //
function mainLoop(){
    panel.port.emit('livecheck', persistent.storage);
}

setMainInterval(getPersistent('interval'));

// Events //
panel.port.on('tab', function (url) {
    tabs.open(url);
    panel.hide();
});

panel.port.on('options', function (_url) {
    showOptions(_url);
    panel.hide();
});

panel.port.on('resize', function (x, y) {
    console.log('x = '+x);
    console.log('y = '+y);
    panel.width = x + 19;
    panel.height = y + 19;
});

panel.port.on('persist', function (name, value) {
    setPersistent(name, value);
});

panel.port.on('twitch-received', function (twitchJson) {
    // checa se está acontecendo uma live
    if(twitchJson.stream){ // live acontecendo
        // joga todos os dados da live nos dados persistentes
        setPersistent('channel', twitchJson.stream);
        // cria um link para o nome do jogo
        var game = twitchJson.stream.game;

        // faz uma checagem pra saber se no loop anterior já estava em live
        if(!getPersistent('streaming')){
            // muda o estado de live para true
            setPersistent('streaming', true);

            // se as notificações estiverem ativadas
            if(getPersistent('notify')){
                var liveGame = game != null ? game : "live";
                liveNotify(
                    "É TEMPO! Começando "+liveGame+" ao vivo agora!",
                    'http://www.twitch.tv/cogumelandooficial/'
                );
            }
            // se as notificações sonoras estiverem ativadas
            if (getPersistent('sound')) {
                // toca o ADANADO
                panel.port.emit('sound-notify', twitch.notifySfx);
            }
        }

        // altera as informações do botão
        setBadgeStream(game);

    }else{ // canal offline
        // altera o estado de stream pra offline
        setPersistent('streaming', false);
        // altera as informações do botão (parecido com o que está acima)
        setBadgeOff();
    }
});

panel.port.on('connection-error', setBadgeIdle);
