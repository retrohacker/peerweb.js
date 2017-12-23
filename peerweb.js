import WebTorrent from 'webtorrent/webtorrent.min' // or ./webtorrent
import async from 'async'
import localforage from 'localforage'

var client = new WebTorrent()
var torrentHashPrefix = 'magnet:?xt=urn:btih:'

var peerweb  = {}
peerweb.debug = false
peerweb.render = function peerWebRender (hash) {
  var torrentHash = torrentHashPrefix + hash
  if (peerweb.debug) console.log('Downloading torrent from', torrentHash)
  client.add(torrentHash, renderFromTorrent)
}

function renderFromTorrent (torrent) {
  if (peerweb.debug) console.log('Torrent Downloaded:')
  if (peerweb.debug) console.log(torrent)

  // Get index.html
  var index = null
  for (var i = 0; i < torrent.files.length; i++) {
    var path = torrent.files[i].path
    if (path === 'index.html') {
      index = torrent.files[i]
    }
  }

  // Store each file in browser storage
  async.each(torrent.files, function (file, cb) {
    file.getBlobURL(function (e, bloburl) {
      if (e && peerweb.debug) console.log('Failed to get blob for', file.path, ':', e)
      if (e) return null
      if (peerweb.debug) console.log('Adding', file.path, 'to browser storage')
      localforage.setItem(file.path, bloburl).then(function () { cb() }).catch(function (e) { cb(e) })
    })
  }, function (e) {
    if (e && peerweb.debug) console.log('Failed to add files to local storage', e)
    if (e) return null
    index.getBuffer(function (e, buffer) {
      if (e && peerweb.debug) console.log('Failed to get index.html buffer', e)
      if (e) return null
      document.body.innerHTML = buffer.toString()
    })
  })
}

peerweb.init = function peerwebInit (cb) {
  if (!navigator.serviceWorker) {
    return cb(new Error('Browser does not support service workers'))
  }
  navigator.serviceWorker.register('./router.js', { scope: './' }).then(function () {
    verifyRouter(cb)
  }).catch(function (e) {
    verifyRouter(cb)
  })
}

function verifyRouter (cb) {
  var request = new XMLHttpRequest()
  request.addEventListener('load', function verifyRouterOnLoad () {
    if (this.status !== 234 || this.statusText !== 'intercepting') {
      cb(new Error('Service Worker not intercepting http requests, perhaps not properly registered?'))
    }
    cb()
  })
  request.open('GET', './peerweb/status')
  request.send()
}

peerweb.init(function (e) {
  if(e) throw e
  peerweb.debug = true
  peerweb.render('ceeaced1aca41e46b23c595c46d8688fcb62070a')
})