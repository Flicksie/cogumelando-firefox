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
    streamTitle: 'LIVE',
    offAirTitle: 'OFF',
    offAirMessage: 'Off-air',
    notifySfx: '../assets/adanado.ogg',
    isStreaming: false
};

persistent.storage.twitch = twitch;

if (persistent.storage.notify === undefined) {
    persistent.storage.notify = true;
}
if (persistent.storage.sound === undefined) {
    persistent.storage.sound = true;
}
if (persistent.storage.interval === undefined) {
    persistent.storage.interval = 1;
}

var button = ToggleButton({
  id: "cogux",
  label: "Cogumelando",
  icon: {
    "24": "./icon-24.png",
    "32": "./icon-32.png",
    "48": "./icon-48.png"
  },
  onChange: handleChange,
  badge: "...",
  badgeColor: "#b4b4b4"
});

var panel = panels.Panel({
    contentURL: self.data.url("panel.html"),
    contentScriptFile: [self.data.url("scripts/jquery.min.js"), self.data.url("scripts/panel-controller.js")],
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
        liveNotify(
            "Notificações estão ativadas, se quiser desativar entre nas opções.",
            "options"
        );
    }
}

function handleHide() {
  button.state('window', {checked: false});
}

function setPersistent(name, value) {
    persistent.storage[name] = value;
}

function liveNotify(msg, url) {
    notifications.notify({
        title: "Cogumelando",
        text: msg,
        iconURL: self.data.url("icon128.png"),
        data: url,
        onClick: function (data) {
            if (data === 'options') {
                showOptions();
            }else {
                tabs.open(data);
            }
        }
    });
}

function showOptions(){
    tabs.open({
        url: _url,
        onReady: function(tab) {
            var worker = tab.attach({
                contentScriptFile: self.data.url("scripts/options-controller.js"),
                contentScriptOptions: {
                    a: "blah"
                }
            });
            worker.port.on("html", function(message) {
                console.log(message);
            });
        }
    });
}

// Events //
panel.port.on('tab', function (url) {
    tabs.open(url);
});

panel.port.on('options', function (_url) {
    showOptions();
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
