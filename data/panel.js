
var buttons = document.getElementsByClassName('corolho'),
    menu = document.getElementById('menu'),
    buttonsHelp = ['Canal do Twitch','Página do Facebook','Site oficial','Opções'],
    disableSound = document.getElementById('sound');
buttons[0].className = 'corolho';

if(localStorage.onStream){
    var stream = JSON.parse(localStorage.channel),
        twitchView = document.getElementsByClassName('twitch');

    buttons[0].className = 'corolho live';
    buttons[0].focus();
    twitchView[0].innerHTML = '<p>'+stream.game+'</p>';
    twitchView[1].innerHTML = `
        <p>
            <img style="width:95%" src="http://static-cdn.jtvnw.net/previews-ttv/live_user_cogumelandooficial-320x180.jpg">
        </p>`;
    twitchView[2].innerHTML = '<p>'+stream.channel.status+'</p>';
}

for (var i = 0; i < buttons.length; i++) {
    setCursorEvent(buttons[i],buttonsHelp[i]);
}

function setCursorEvent(element, help){
    element.onmouseover = function(){
        menu.innerHTML = '<small>'+help+'</small>';
    }
    element.onmouseout = function(){
        menu.innerHTML = '';
    }
}


disableSound.checked = localStorage.sound ? false : true;
disableSound.onchange = function(){
    if(this.checked){
        localStorage.removeItem('sound');
    }else{
        localStorage.setItem('sound',true);
    }
}
