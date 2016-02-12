peerweb.js
==========

A client side library for retrieving and rendering a static website over torrent.

# Usage

```js
window.peerweb.init(function(e) {
  if(e) throw e
  window.peerweb.debug = true
  window.peerweb.render([torrent_hash])
})
```

PeerWeb will download the directory from the torrent passed into `render`, and will replace the contents of `document.body` with the file `index.html` from the torrent. All subsequent `GET` http requests will be resolved against the torrent file.

The torrent should be structured something like:

```
./
├── imgs
│   ├── foo.png
│   └── bar.png
├── css
│   └── index.css
└── index.html
```

The main takeaway from the above diagram is that `peerweb` requires your torrent to have an `index.html` and that you can have nested subdirectories.

For an example, download [ws](https://www.npmjs.com/package/local-web-server) and run it in the `./example` directory in this repo.

# Dependencies

All dependencies can be found in this repo under the `./example` directory.

* [async v1.5.2](https://github.com/caolan/async)
* [localforage-v1.2.6](https://github.com/mozilla/localForage)
* [webtorrent-v0.72.1](https://github.com/feross/webtorrent)

Unfortunately, peerweb only works in Chromium 49 or later (google-chrome-beta at the time of this writing). Chrome <40 has a bug preventing ServiceWorkers from loading `blob` files and all versions of Firefox that support ServiceWorkers has a bug preventing WebSockets from working when ServiceWorkers are being used for the page.

# Installation

Download the above dependencies. Place `router.js` in the base of your project directory (along-side `index.html`). Then add the following to the `<head>` of your `index.html` file:

```html
<script src="./path/to/async-1.5.2.js"></script>
<script src="./path/to/localforage-1.2.6.min.js"></script>
<script src="./path/to/webtorrent-0.72.1.min.js"></script>
<script src="./path/to/peerweb.js"></script>
```

> Note: it is critical that router.js be served directly from ./router.js and not a subdirectory of your project. This allows the ServiceWorker to intercept all http requests for the webpage

# How it works

peerweb uses the webtorrent project to download a static website. It then stores paths to the `blob`s for each file in the torrent in the browser's storage using localforage. It registers a ServiceWorker to intercept http requests from the page and attempts to resolve them against blobs found in the browser's storage. It then searches for `index.html` in the torrent and drops it into the current `document.body` triggering the website to render and the http requests to be intercepted by the ServiceWorker.
