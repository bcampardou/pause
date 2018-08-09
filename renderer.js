const remote = require('electron').remote,
    videojs = require('video.js'),
    playlist = require('videojs-playlist'),
    config = require('./config'),
    search = require('youtube-search');
require('videojs-youtube');

let playlistInfos = [],
    searchResults = [],
    player,
    refreshPlaylist = () => {
        player.playlist(playlistInfos);
    },
    initPlayer = function () {
        videojs.registerPlugin('playlist', playlist);

        player = videojs('vjs-player', {
            controls: false,
            preload: true,
            "techOrder": ["youtube"],
            "youtube": { "iv_load_policy": 3, "ytControls": 2, "showinfo": 0, "modestbranding": 0, "color": "white", "autoplay": 1 }

        }).ready(function () {
            player = this;
            player.removeChild('BigPlayButton');
            refreshPlaylist();
            player.on('ended', function () {
                player.playlist.next();
            });
        });
    }

document.addEventListener('DOMContentLoaded', () => {
    debugger;
    console.log(config);
    // morphsearch
    let morphSearch = document.getElementById('morphsearch'),
        input = morphSearch.querySelector('input.morphsearch-input'),
        submitButton = morphSearch.querySelector('.morphsearch-submit'),
        ctrlClose = morphSearch.querySelector('span.morphsearch-close'),
        playlistColumn = morphSearch.querySelector('#playlist'),
        resultsColumn = morphSearch.querySelector('#results'),
        isOpen = isAnimating = false,
        // show/hide search area
        toggleSearch = function (evt) {
            evt.stopPropagation();
            // return if open and the input gets focused
            if (evt.type.toLowerCase() === 'focus' && isOpen) return false;

            var offsets = morphsearch.getBoundingClientRect();
            if (isOpen) {
                morphSearch.classList.remove('open');

                // trick to hide input text once the search overlay closes
                if (input.value !== '') {
                    setTimeout(function () {
                        morphSearch.classList.add('hideInput');
                        setTimeout(function () {
                            morphSearch.classList.remove('hideInput');
                            input.value = '';
                        }, 300);
                    }, 500);
                }

                input.blur();
            }
            else {
                morphSearch.classList.add('open');
            }
            isOpen = !isOpen;
        };


    submitButton.addEventListener('click', function (event) {
        event.preventDefault();
        resultsColumn.innerHTML = '<h2>Results</h2>';
        search(input.value, {
            maxResults: 10,
            type: 'video',
            key: config.YOUTUBE_API_KEY
        }, (err, results) => {
            if (!!err) { console.log(err); return; }

            searchResults = results;
            for (var i in searchResults) {
                var videoItem = `<a class="dummy-media-object" href="#" 
                    data-id="${searchResults[i].id}"
                    data-link="${searchResults[i].link}"
                    data-title="${searchResults[i].title} (${searchResults[i].channelTitle})"
                    data-thumbnail="${searchResults[i].thumbnails.high.url}">
                    <img src="${searchResults[i].thumbnails.high.url}" />
                    <h3>${searchResults[i].title} (${searchResults[i].channelTitle})</h3>
              </a>`;
                resultsColumn.insertAdjacentHTML('beforeend', videoItem);
            }
        });
    });

    resultsColumn.addEventListener('click', function (ev) {
        var dummyMediaObject = ev.target.closest('.dummy-media-object');
        if (!dummyMediaObject) return;

        ev.preventDefault();
        for (var i in searchResults) {
            if (dummyMediaObject.dataset.id === searchResults[i].id) {
                //push in playlist
                playlistInfos.push({
                    name: dummyMediaObject.dataset.title,
                    sources: [
                        {
                            src: dummyMediaObject.dataset.link,
                            type: 'video/youtube'
                        }
                    ]
                });
                refreshPlaylist();
                var copiedDummyMO = dummyMediaObject.cloneNode(true);
                copiedDummyMO.dataset.playlistIndex = playlistInfos.length - 1;
                playlistColumn.insertAdjacentHTML('beforeend', copiedDummyMO.outerHTML);
                toggleSearch(ev);
                return;
            }
        }
    });

    playlistColumn.addEventListener('click', function (ev) {
        var dummyMediaObject = ev.target.closest('.dummy-media-object');
        if (!dummyMediaObject) return;

        ev.preventDefault();
        player.playlist.currentItem(parseInt(dummyMediaObject.dataset.playlistIndex));
        toggleSearch(ev);
    });

    // events
    morphSearch.addEventListener('click', function (event) {
        if (this.classList.contains('open') === false) toggleSearch(event);
    })
    input.addEventListener('focus', toggleSearch);
    ctrlClose.addEventListener('click', toggleSearch);
    // esc key closes search overlay
    // keyboard navigation events
    document.addEventListener('keydown', function (ev) {
        var keyCode = ev.keyCode || ev.which;
        if (keyCode === 27 && isOpen) {
            toggleSearch(ev);
        }
    });

    // titlebar
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

    initPlayer();
});