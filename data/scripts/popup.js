// NOTE: This file is only example from chrome extension

window.onload = function () {
    "use strict";
    // checagem do canal do twitch
    getTwitch(twitch.username);
    var imgLoader = new ImageLoader();

    // elementos para os botões e o input do disableSound
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
            '../pages/options.html'
        ],
        disableSound = document.getElementById('sound');

    // força o botão do twitch a ser somente da classe corolho
    buttons[0].className = 'corolho';

    // recebe as informações da live
    var stream = JSON.parse(localStorage.channel),
        twitchView = document.getElementsByClassName('twitch');

    // é executado somente se estiver ao vivo
    if(localStorage.onStream){
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

            var streamImg = imgLoader.load(stream.preview.medium+'?force='+imageForce, {'draggable':false});
            imgLoader.onload(function () {
                twitchView[1].innerHTML = '<p></p>';
                streamImg.className = 'stream-preview';
                twitchView[1].firstChild.appendChild(streamImg);
            });
        });

        twitchView[2].innerHTML = '<p>'+liveTitle+'</p>';

    }else{
        $.ajax(
            {
                url:'https://api.twitch.tv/kraken/channels/cogumelandooficial/videos',
                success:function(result){

                    function randomInt(min, max) {
                        return Math.floor(Math.random() * (max - min + 1)) + min;
                    }
                    var rand = randomInt(0, result.videos.length-1);

                    twitchView[0].innerHTML = `
                        <p class="click">
                            Veja também: ${result.videos[rand].game}
                        </p>`;
                    twitchView[0].onclick = function(){
                        chrome.tabs.create({'url': result.videos[rand].url});
                    };

                }
            }
        );
    }

    buttons[0].onclick = function(){
        chrome.tabs.create({'url': buttonsUrl[0]});
    };
    buttons[1].onclick = function(){
        chrome.tabs.create({'url': buttonsUrl[1]});
    };
    buttons[2].onclick = function(){
        chrome.tabs.create({'url': buttonsUrl[2]});
    };
    buttons[3].onclick = function(){
        chrome.tabs.create({'url': buttonsUrl[3]});
    };
    buttons[4].onclick = function(){
        chrome.tabs.create({'url': buttonsUrl[4]});
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

    // checkbox do disableSound
    disableSound.checked = localStorage.sound ? false : true;
    disableSound.onchange = function(){
        if(this.checked){
            localStorage.removeItem('sound');
        }else{
            localStorage.setItem('sound',true);
        }
    };

};
