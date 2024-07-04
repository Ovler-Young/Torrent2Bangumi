# Torrent 2 Bangumi

## Usage

Post a request to `${YOUR_WORKER_URL}/resolve` with the following JSON body:

``` json
{
    "name": "The name of the torrent",
    "time": "The creation time of the torrent",
}
```

It will return a JSON object with the following structure:

``` javascript
{
    "inputFilename": ${inputFilename},
    "inputPubDate": ${inputPubDate},
    "fansubGroup": string,
    "resolution": string, // 1080p, 720p, 480p, etc.
    "hasSubtitles": boolean, // true or false
    "audioTracks": string, // AAC, FLAC, etc.
    "subject": {
    "date": string, // yyyy-mm-dd, the start date of the anime season
    ... // other fields from the Bangumi API
    "episodes": [
        {
            "airdate": string, // yyyy-mm-dd
            "name": string,
            "name_cn": string,
            "ep": int,
            "sort": int,
            "id": int,
            "desc": string,
            ... // other fields from the Bangumi API
        },
  ]

```

If you're sure there have no `/` in the torrent name, you can simply get the result by visiting `${YOUR_WORKER_URL}/resolve/${name}/${time}`.

By the way, if you add `?pretty` to the URL, the result will be formatted in a more readable way.

## Development

You may need to install [pnpm](https://pnpm.io/) first.

Other requirements are:

- API key for [Bangumi](https://bgm.tv). You can get it from [here](https://next.bgm.tv/demo/access-token).

- API key for [groq](https://groq.com/). You can register an account and get it from [here](https://console.groq.com/keys).

- If you want to deploy the project, you need to have a [Cloudflare](https://www.cloudflare.com/) account.  [Wrangler](https://developers.cloudflare.com/workers/cli-wrangler/install-update) will automatically installed when you install the dependencies.

``` shell
git clone https://github.com/Ovler-Young/Torrent2Bangumi.git
pnpm install
# pnpm wrangler login # if not logged in
pnpm wrangler secret put BANGUMI_API_KEY
pnpm wrangler secret put GROQ_API_KEY
pnpm run dev
```

When all things seem to be OK, you can then deploy the project.

``` shell
pnpm run deploy
```
