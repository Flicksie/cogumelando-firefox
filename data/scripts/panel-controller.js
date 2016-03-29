console.log("-- Panel Controller --");
// força a desativação do cache do ajax
$.ajaxSetup({cache:false});

var imgLoader = new ImageLoader();
var buttons = document.getElementsByClassName('corolho'),
    menu = document.getElementById('menu'),
    buttonsHelp = [
        'Canal do Twitch',
        'Página do Facebook',
        'Página do Twitter',
        'Site oficial',
        'Opções'
    ],
    buttonsUrl = [
        'http://www.twitch.tv/cogumelandooficial/',
        'https://www.facebook.com/Cogumelando',
        'https://twitter.com/cogumelandosite',
        'http://www.cogumelando.com.br/',
        'pages/options.html'
    ],
    disableSound = document.getElementById('sound'),
    twitchView = document.getElementsByClassName('twitch');


buttons[0].onclick = function(){
    self.port.emit('tab', buttonsUrl[0]);
};
buttons[1].onclick = function(){
    self.port.emit('tab', buttonsUrl[1]);
};
buttons[2].onclick = function(){
    self.port.emit('tab', buttonsUrl[2]);
};
buttons[3].onclick = function(){
    self.port.emit('tab', buttonsUrl[3]);
};
buttons[4].onclick = function(){
    self.port.emit('options', buttonsUrl[4]);
};

// loop para criar os eventos de hover dos botões
for (var i = 0; i < buttons.length; i++) {
    setCursorEvent(buttons[i],buttonsHelp[i]);
}

// Método para inserir os textos dos botões
function setCursorEvent(element, help){
    element.onmouseover = function(){
        menu.innerHTML = '<small>'+help+'</small>';
    }
    element.onmouseout = function(){
        menu.innerHTML = '';
    }
}

function showStreamSuggestion() {
    console.log("Ajax init");
    $.ajax(
        {
            url:'https://api.twitch.tv/kraken/channels/cogumelandooficial/videos',
            success: function(result){
                console.log("Sucesso");

                function randomInt(min, max) {
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                }
                var rand = randomInt(0, result.videos.length-1);

                twitchView[0].innerHTML = `
                    <p class="click">
                        Veja também: ${result.videos[rand].game}
                    </p>`;
                twitchView[0].onclick = function(){
                    self.port.emit('tab', result.videos[rand].url);
                };
                resetSize();
            },
            error: function () {
                console.log('Falha');
            }
        }
    );
}

function showStreamInfo(stream) {
    var liveType = document.getElementsByTagName('img')[0];
    // insere coisas da live no popup (título,nome do jogo, screenshot)
    buttons[0].className = 'corolho live';
    buttons[0].focus();

    // Força o recarregamento da imagem
    var imageForce = btoa(new Date().toJSON());

    var liveTitle = stream.channel.status;
    if(liveTitle.search("DAFM") !== -1){
        liveType.className = 'live-type';
        liveType.src = '../assets/dafm.png';
    }else if(liveTitle.search("Game Quest") !== -1 || liveTitle.search("CGQ") !== -1){
        liveType.className = 'live-type';
        liveType.src = '../assets/cogugq.png';
    }

    twitchView[0].innerHTML = stream.game != null ? '<p>'+stream.game+'</p>' : '';
    twitchView[1].innerHTML = '<p></p>';

    var streamDefault = imgLoader.load(stream.channel.video_banner, {'class':'stream-preview', 'draggable':false});
    imgLoader.onload(function () {
        twitchView[1].firstChild.appendChild(streamDefault);
        resetSize();

        var streamImg = imgLoader.load(
            stream.preview.medium+'?force='+imageForce,
            {'draggable':false, 'class':'stream-preview'}
        );
        imgLoader.onload(function () {
            twitchView[1].innerHTML = '<p></p>';
            twitchView[1].firstChild.appendChild(streamImg);
            resetSize();
        });
    });

    twitchView[2].innerHTML = '<p>'+liveTitle+'</p>';
}

function clearTwitchElements() {
    console.log("Clear Twitch");
    twitchView[0].innerHTML = '';
    twitchView[1].innerHTML = '';
    twitchView[2].innerHTML = '';
}

function resetSize() {
    self.port.emit('resize', document.body.offsetWidth, document.body.offsetHeight);
}

// checkbox do disableSound
disableSound.onchange = function(){
    if(this.checked){
        self.port.emit('persist','sound', false);
    }else{
        self.port.emit('persist','sound', true);
    }
};

function playNotificationSound(sfx) {
    // se as notificações sonoras estiverem ativadas
    // toca o ADANADO
    var notify = new Howl({
        urls: [sfx]
    }).play();
}

// Método que faz o request ajax no canal do twitch
// @username: usuário do twitch
function getTwitch(username, callback){
    callback = callback || function (channel) {};
    $.ajax({
        url:'https://api.twitch.tv/kraken/streams/'+username,
        success:function(channel) {
            // método executado se o ajax tiver sucesso
            self.port.emit('twitch-received', channel);
            callback(channel);
        },
        error:function() {
            // método executado caso não tenha sucesso
            // isso pode acontecer caso esteja sem internet
            // ou alguma issue da extensão ou do navegador
            self.port.emit('connection-error');
            callback(false);
        }
    });
}

function setPanelStream(channel){
    if (channel) { // on stream
        if (channel.stream) {
            showStreamInfo(channel.stream);
            resetSize();
            return;
        }
    }
    // off
    showStreamSuggestion();
}

// Main-> Listeners

// On popup open
self.port.on("open", function(persist, twitch){
    console.log(persist.sound);
    clearTwitchElements();
    disableSound.checked = !persist.sound;
    resetSize();
    getTwitch(persist.twitch.username, setPanelStream);
});

// On livecheck
self.port.on("livecheck", function(persist){
    getTwitch(persist.twitch.username);
});

// On sound notify
self.port.on("sound-notify", function(soundfile){
    playNotificationSound(soundfile);
});
