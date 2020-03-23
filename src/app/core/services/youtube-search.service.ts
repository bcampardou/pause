import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';

import {map} from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { YouTubeSearchResult, YouTubeAPISearchResult } from '../models/youtube-search-result.model';

export const YOUTUBE_API_KEY = 'AIzaSyD84zVLKKKtHnVIcFpWVSJZ9NMwCca4CsA';
export const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

@Injectable()
export class YouTubeSearchService {
  constructor(
    private http: HttpClient,
    @Inject(YOUTUBE_API_KEY) private apiKey: string,
    @Inject(YOUTUBE_API_URL) private apiUrl: string,
  ) {}

  search(query: string): Observable<YouTubeSearchResult[]> {
    const params: string = [
      `q=${query}`,
      `key=${this.apiKey}`,
      `part=snippet`,
      `type=video`,
      `maxResults=10`
    ].join('&');
    const queryUrl = `${this.apiUrl}?${params}`;

    return this.http.get<YouTubeAPISearchResult>(queryUrl).pipe(
      map((response: YouTubeAPISearchResult) => {
        return response.items.map(item => {
          const video = new YouTubeSearchResult();
          video.id = item.id.videoId;
          video.title = item.snippet.title;
          video.description = item.snippet.description;
          video.thumbnailUrl = item.snippet.thumbnails.high.url;
          return video;
        })
      }));
  }
}