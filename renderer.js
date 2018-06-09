// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const remote = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;
const videojs = require('video.js');
const playlist = require('videojs-playlist');
const playlistUi = require('videojs-playlist-ui');
const mime = require('mime-types');

let playlistInfos = [];

let player;

let hackMimeType = (type) => {
    switch (type) {
        case 'video/quicktime': return 'video/mp4';
        default: return type;
    }
}

ipcRenderer.on('file-received', function(event, path) {
    if (!!path) {
        let filename = path.split('/').pop();
        playlistInfos.push({
            name: filename,
            sources: [
                {
                    src: 'file:///' + path,
                    type: hackMimeType(mime.lookup(filename))
                }]
        });
        player.playlist(playlistInfos);
    }
});

let initPlayer = function () {
    videojs.registerPlugin('playlist', playlist);
    videojs.registerPlugin('playlistUi', playlistUi);

    let Button = videojs.getComponent('Button');
    let PlaylistButton = videojs.extend(Button, {
        constructor: function () {
            Button.apply(this, arguments);
            this.controlText('Playlist');
            this.addClass('icon-playlist');
        },
        handleClick: function () {
            /* do something on click */
            document.querySelector('body').classList.toggle('open-playlist');
        }
    });
    let LoopButton = videojs.extend(Button, {
        constructor: function () {
            Button.apply(this, arguments);
            this.controlText('Loop');
            this.addClass('icon-loop');
        },
        handleClick: function () {
            document.querySelector('.icon-loop').classList.toggle('active');
            /* do something on click */
            player.loop(!player.loop());
        }
    });
    videojs.registerComponent('LoopButton', LoopButton);
    videojs.registerComponent('PlaylistButton', PlaylistButton);

    player = videojs('player', {
        controls: true,
        autoplay: true,
        preload: true
    });
    player.removeChild('BigPlayButton');
    


    player.playlist(playlistInfos);
    player.playlistUi({ playOnSelect: true });
    player.getChild('controlBar').addChild('LoopButton', {});
    player.getChild('controlBar').addChild('PlaylistButton', {});
    
}

document.addEventListener('DOMContentLoaded', () => {
    initPlayer();

    var fileInput = document.querySelector(".input-file");
    fileInput.addEventListener("change", function (event) {
        for (let i = 0; i < this.files.length; i++) {
            playlistInfos.push({
                name: this.files[i].name,
                sources: [
                    { 
                        src: 'file:///' + this.files[i].path.split('\\').join('/'), 
                        type: hackMimeType(this.files[i].type) 
                    }
                ]
            });
        }
        player.playlist(playlistInfos, player.playlist.lastIndex() + 1);
        this.value = null;
        this.files = null;
    });

    document.querySelector('#video-container').addEventListener('dragenter', () => {
        document.querySelector('body').classList.add('open-playlist');
    });

    document.querySelector('.close-btn').addEventListener('click', () => {
        remote.app.exit();
    });

    document.querySelector('.large-btn').addEventListener('click', () => {
        document.querySelector('body').classList.toggle('maximized');
        let window = remote.getCurrentWindow();
        window.isMaximized() ? window.unmaximize() : window.maximize();
    });

    document.querySelector('.minimize-btn').addEventListener('click', () => {
        remote.getCurrentWindow().minimize();
    });

    document.querySelector('#alwaysOnTop').addEventListener('change', (event) => {
        remote
            .getCurrentWindow()
            .setAlwaysOnTop(event.srcElement.checked);
    });
});