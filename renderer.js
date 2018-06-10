const remote = require('electron').remote,
      ipcRenderer = require('electron').ipcRenderer,
      videojs = require('video.js'),
      playlist = require('videojs-playlist'),
      playlistUi = require('videojs-playlist-ui'),
      mime = require('mime-types'),
      ffmpeg = require('fluent-ffmpeg');

let playlistInfos = [],
    outputFolder = remote.app.getPath('temp'),
    supportedFormats = ['video/mp4', 'video/ogg', 'video/ogv', 'video/webm'],
    player,
    addToPlaylist = (path) => {
        path = path.split('\\').join('/');
        let filenameWithExt = path.split('/').pop(),
            type = mime.lookup(path),
            filename = filenameWithExt.split('.').slice(0, -1).join('.'),
            outputPath = outputFolder + '/' + filename + '.mp4';

        if (supportedFormats.indexOf(type) > -1) {
            playlistInfos.push({
                name: filenameWithExt,
                sources: [
                    {
                        src: 'file:///' + path,
                        type: type
                    }
                ]
            });
            return;
        }
        console.log(outputPath);
        let command = ffmpeg(path)
            .output(outputPath)
            .on('end', function (event) {
                playlistInfos.push({
                    name: filenameWithExt + '(mp4)',
                    sources: [
                        {
                            src: 'file:///' + outputPath,
                            type: 'video/mp4'
                        }
                    ]
                });
                refreshPlaylist();
            })
            .run();

    },
    refreshPlaylist = () => {
        player.playlist(playlistInfos);
    };

ipcRenderer.on('file-received', function (event, path) {
    if (!!path) addToPlaylist(path);
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

    player.playlistUi({ playOnSelect: true });
    player.getChild('controlBar').addChild('LoopButton', {});
    player.getChild('controlBar').addChild('PlaylistButton', {});

}

document.addEventListener('DOMContentLoaded', () => {
    initPlayer();
    document.querySelector(".input-file")
            .addEventListener("change", function (event) {
                for (let i = 0; i < this.files.length; i++) {
                    addToPlaylist(this.files[i].path);
                }
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