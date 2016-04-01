console.log("-- Options Controller --");

var sounds = document.getElementsByName('sound'),
    notify = document.getElementsByName('notify'),
    loop = document.getElementsByName('loop'),
    reset = document.getElementById('reset'),
    minutes = [1,2,5,10,20,30],
    persistent = null;


function checkStorage(element, storage){
    if(persistent[storage]){
        element[0].className = "pressed";
    }else{
        element[1].className = "pressed";
    }
}

function checkLoop(){
    var loopMin = parseInt(persistent.interval);
    if(loopMin == 1){
        loop[0].className = "pressed";
    }else if(loopMin == 2){
        loop[1].className = "pressed";
    }else if(loopMin == 5){
        loop[2].className = "pressed";
    }else if(loopMin == 10){
        loop[3].className = "pressed";
    }else if(loopMin == 20){
        loop[4].className = "pressed";
    }else if(loopMin == 30){
        loop[5].className = "pressed";
    }
}

function configLoop(element, min){
    element.onclick = function(){
        self.port.emit('config-change', 'interval', min);
        this.className = "pressed";
        for (var i = 0; i < loop.length; i++) {
            if(loop[i].innerHTML !== min+" min"){
                loop[i].className = '';
            }
        }
    }
}

function configButton(element,storage){
    element[0].onclick = function(){
        self.port.emit('config-change', storage, true);
        this.className = "pressed";
        element[1].className = '';
    };
    element[1].onclick = function(){
        self.port.emit('config-change', storage, false);
        this.className = "pressed";
        element[0].className = '';
    };
}

self.port.on('persist-received', function (_persistent) {
    persistent = _persistent;
    checkStorage(sounds,'sound');
    checkStorage(notify,'notify');
    checkLoop();
    configButton(sounds,'sound');
    configButton(notify,'notify');

    for (var i = 0; i < loop.length; i++) {
        configLoop(loop[i],minutes[i]);
    }

    reset.onclick = function () {
        self.port.emit("config-change", 'POW');
    };

    document.querySelector('#extension-version').innerHTML = persistent.version;
});

document.querySelector('#options').style.display='block';
self.port.emit('request-persistent');
