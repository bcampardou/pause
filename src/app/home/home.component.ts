import { Component, OnInit, AfterViewInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { YouTubeSearchService } from '../core/services/youtube-search.service';
import { take } from 'rxjs/operators';
import { YouTubeSearchResult } from '../core/models/youtube-search-result.model';
import { remote } from 'electron';
import * as mousetrap from 'mousetrap';
import { mousetrapGlobal } from '../shared/mousetrap-global-bind.js';
import { BehaviorSubject } from 'rxjs';
import { PlyrComponent } from '../shared/plyr/public_api';
import { StateService } from '../core/state.service';

const Mousetrap = mousetrapGlobal(mousetrap());
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild(PlyrComponent, { static: false })
  plyr: PlyrComponent;

  // or get it from plyrInit event
  player: Plyr;

  public currentVideoId;
  public currentVideos;
  public searchText: string;
  public searchMode: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public videos: Array<YouTubeSearchResult> = [];
  public isHover: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  plyrOptions = {
    autoplay: true,
    youtube: {
      cc_lang_pref: 'en',
      controls: 0,
      suggestedQuality: 'large',
      disablekb: 0,
      color: 'white',
      iv_load_policy: 3,
      showinfo: 0,
      rel: 0
    }
  };
  @ViewChild('searchInput', {
    static: false
  })
  searchInput: ElementRef;
  ctrlKey: string;

  constructor(private youtubeService: YouTubeSearchService,
    private stateService: StateService,
    private zone: NgZone) { 
      this.isHover = this.stateService.isApplicationPointed$;
      this.ctrlKey = this.stateService.isMac ? 'Cmd' : 'Ctrl';
    }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    // const iframeMousetrap = new Mousetrap(this.player.getIframe());
    // iframeMousetrap.bind(['command+f', 'ctrl+f'], () => {
    //   this.zone.run(() => {
    //     const val = !this.searchMode.getValue();
    //     this.searchMode.next(val);
    //     if(val) {
    //       setTimeout(() => {
    //         console.log(this.searchInput.nativeElement);
    //         this.searchInput.nativeElement.focus();
    //       }, 600)

    //     }
    //   });
    // });

    Mousetrap.bindGlobal(['command+f', 'ctrl+f'], () => {
      this.zone.run(() => {
        const val = !this.searchMode.getValue();
        console.log(val);
        this.searchMode.next(val);
        if (val) {
          setTimeout(() => {
            console.log(this.searchInput.nativeElement);
            this.searchInput.nativeElement.focus();
          }, 600)

        }
      });
    });

    Mousetrap.bind('?', () => {
      this.zone.run(() => {
        console.log('show shortcuts');
      });
    });
  }

  startPlayer(player) {
    this.player = player;
    this.player.play();
  }

  initPlayer($event: Plyr) {
    $event.autoplay = true;
    this.player = $event;
    this.player.play();
  }

  playVideo(video: YouTubeSearchResult) {
    this.currentVideoId = video.id;
    this.searchMode.next(false);
    this.searchText = '';
    this.currentVideos = [{ src: this.currentVideoId, provider: 'youtube' }];
    if (this.player) {
      // this.player.source = new Plyr.SourceInfo() ;
    }
  }

  search() {
    this.videos = []
    this.youtubeService.search(this.searchText).pipe(
      take(1)).subscribe(results => {
        this.videos = results;
        this.searchText = '';
      });
  }

  alwaysOnTopChanged(event) {
    remote
      .getCurrentWindow()
      .setAlwaysOnTop(event.srcElement.checked);
  }

  minimize() {
    remote.getCurrentWindow().minimize();
  }

  close() {
    remote.app.exit();
  }

}
