export class YouTubeAPISearchResult {
    items: Array<{
        "etag": string;
        "id": {
            "kind": string,
            "videoId": string,
            "channelId": string,
            "playlistId": string
        };
        "snippet": {
            "publishedAt": Date,
            "channelId": string,
            "title": string,
            "description": string,
            "thumbnails": {
                "high": {
                    "url": string,
                    "width": number,
                    "height": number
                },
                (key): {
                    "url": string,
                    "width": number,
                    "height": number
                }
            },
            "channelTitle": string,
            "liveBroadcastContent": string
        }
    }>;
}

export class YouTubeSearchResult {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
}