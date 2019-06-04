const remote = require('electron').remote,
    videojs = require('video.js'),
    config = require('./config'),
    search = require('youtube-search');
require('videojs-youtube');

document.addEventListener('DOMContentLoaded', () => {
    let searchForm = document.querySelector('#search-form'),
        searchField = searchForm.querySelector('#inpt_search'),
        resultsColumn = document.querySelector('#results'),
        searchResults = [],
        isOpen = isAnimating = false,
        currentVideo = { id: 'e-AlzW6tnmo', type: 'video/youtube', src: 'https://www.youtube.com/watch?v=e-AlzW6tnmo' },
        playRelatedVideo = function () {
            search('', {
                relatedToVideoId: currentVideo.id,
                maxResults: 1,
                videoEmbeddable: true,
                videoSyndicated: true,
                type: 'video',
                key: config.YOUTUBE_API_KEY
            }, (err, results) => {
                if (!!err) { console.log(err); return; }

                result = results[0];
                if (!!result) {
                    playWithInfos({ id: result.id, type: 'video/youtube', src: result.link });
                }
            });
        },
        initPlayer = function () {
            return videojs('vjs-player', {
                
            }, function () {
                this.removeChild('BigPlayButton');
                this.on('ended', function () {
                    playRelatedVideo();
                });
                this.on('error', function (event) {
                    if (!event) return;

                    this.error(null);
                    playRelatedVideo();
                });
            });
        },
        player = initPlayer(),
        playWithInfos = function (infos) {
            console.log('playWithInfos');
            if (!!player) {
                currentVideo = infos;
                player.src({ type: currentVideo.type, src: currentVideo.src });
                player.play();
            }
        };

    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        resultsColumn.innerHTML = '';
        resultsColumn.classList.add('visible');
        isOpen = true;
        search(searchField.value, {
            maxResults: 20,
            type: 'video',
            videoEmbeddable: 'true',
            videoSyndicated: 'true',
            key: config.YOUTUBE_API_KEY
        }, (err, results) => {
            if (!!err) { console.log(err); return; }

            searchResults = results;
            for (var i in searchResults) {
                var videoItem = `<a class="dummy-media-object" href="#" 
                    data-index="${i}" 
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
        searchField.closest('.search').classList.remove('active');
        resultsColumn.classList.remove('visible');
        isOpen = false;
        for (var i in searchResults) {
            if (dummyMediaObject.dataset.id === searchResults[i].id) {
                playWithInfos({ id: dummyMediaObject.dataset.id, type: 'video/youtube', src: dummyMediaObject.dataset.link });
                return;
            }
        }
    });

    // events
    searchField.addEventListener('focus', function (event) {
        if (resultsColumn.classList.contains('visible') === false) {
            searchField.closest('.search').classList.add('active');
            resultsColumn.classList.add('visible');
            isOpen = true;
        }
    });
    // ctrlClose.addEventListener('click', toggleSearch);
    // esc key closes search overlay
    // keyboard navigation events
    document.addEventListener('keydown', function (ev) {
        if (ev.code === 'Escape' && isOpen) {
            searchField.closest('.search').classList.remove('active');
            resultsColumn.classList.remove('visible');
            isOpen = false;
        } else if (ev.target.classList.contains('html5-video-player')) {
            let event = new ev.constructor(ev.type, ev);
            document.querySelector('.html5-video-player').dispatchEvent(event);
        }
    });

    // document.addEventListener('click', function (ev) {
    //     if (ev.target.tagName.toLowerCase() === 'a') {
    //         if (ev.target.href.indexOf('/watch?v=')) {
    //             ev.preventDefault();
    //             let videoId = ev.target.href.split('/watch?v=').pop();
    //             playWithInfos({ id: videoId, type: 'video/youtube', src: 'https://www.youtube.com/watch?v=' + videoId });
    //         }
    //     }
    // });

    // titlebar
    document.querySelector('.close-btn').addEventListener('click', () => {
        remote.app.exit();
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