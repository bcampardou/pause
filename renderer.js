// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const electron = require('electron');
const videojs = require('video.js');
const menu = require('videojs-contextmenu');
const menuUi = require('videojs-contextmenu-ui');
const playlist = require('videojs-playlist');
const playlistUi = require('videojs-playlist-ui');
const mime = require('mime-types');

let playlistInfos = []

let player;

let initPlayer = function () {
    videojs.registerPlugin('playlist', playlist);
    videojs.registerPlugin('playlistUi', playlistUi);

    videojs.registerPlugin('contextmenu', menu);
    videojs.registerPlugin('contextmenuUI', menuUi);

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
    videojs.registerComponent('PlaylistButton', PlaylistButton);

    player = videojs('player', {
        controls: true,
        autoplay: true,
        preload: true
    });
    player.removeChild('BigPlayButton');
    player.playlistUi({ playOnSelect: true });
    let path = electron.ipcRenderer.sendSync('get-file-data');
    if (!!path) {
        let filename = path.split('/').pop();
        let data = {
            name: filename,
            sources: [
                {
                    src: 'file:///' + path,
                    type: mime.lookup(filename)
                }]
        }
        if (!!data) playlistInfos.push(data);
    }

    player.playlist(playlistInfos);
    player.getChild('controlBar').addChild('PlaylistButton', {});
    player.contextmenu();
    player.contextmenuUI({
        content: []
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initPlayer();

    var fileInput = document.querySelector(".input-file");
    fileInput.addEventListener("change", function (event) {
        for (let i = 0; i < this.files.length; i++) {
            playlistInfos.push({
                name: this.files[i].name,
                sources: [{ src: 'file:///' + this.files[i].path.split('\\').join('/'), type: this.files[i].type }]
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
        electron.remote.app.exit();
    });

    document.querySelector('.large-btn').addEventListener('click', () => {
        document.querySelector('body').classList.toggle('maximized');
        let window = electron.remote.getCurrentWindow();
        window.isMaximized() ? window.unmaximize() : window.maximize();
    });

    document.querySelector('.minimize-btn').addEventListener('click', () => {
        electron.remote.getCurrentWindow().minimize();
    });

    document.querySelector('#alwaysOnTop').addEventListener('change', (event) => {
        electron.remote
            .getCurrentWindow()
            .setAlwaysOnTop(event.srcElement.checked);
    });
});