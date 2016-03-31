console.log("-- Options Controller --");

var sounds = document.getElementsByName('sound'),
    notify = document.getElementsByName('notify'),
    loop = document.getElementsByName('loop'),
    reset = document.getElementById('reset'),
    minutes = [1,2,5,10,20,30];


reset.onclick = function () {
    self.port.emit("config-change", 'POW');
};
