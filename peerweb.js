;(function () {
  var client = new window.WebTorrent()
  var torrentHashPrefix = 'magnet:?xt=urn:btih:'

  function renderError (msg) {
    document.body.innerHTML = '<h1 style="color: red;">' + msg + '</h1>'
  }

  if (!window.navigator.serviceWorker) {
    renderError('Browser does not support service workers, please upgrade')
  }

  var peerweb = window.peerweb = {}
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
    window.async.each(torrent.files, function (file, cb) {
      file.getBlobURL(function (e, bloburl) {
        if (e && peerweb.debug) console.log('Failed to get blob for', file.path, ':', e)
        if (e) return null
        if (peerweb.debug) console.log('Adding', file.path, 'to browser storage')
        window.localforage.setItem(file.path, bloburl).then(function () { cb() }).catch(function (e) { cb(e) })
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
    window.navigator.serviceWorker.register('./router.js').then(function () {
      verifyRouter(cb)
    }).catch(function (e) {
      verifyRouter(cb)
    })
  }

  function verifyRouter (cb) {
    var request = new window.XMLHttpRequest()
    request.addEventListener('load', function verifyRouterOnLoad () {
      if (this.status !== 234 || this.statusText !== 'intercepting') {
        cb(new Error('Service Worker not intercepting http requests, perhaps not properly registered?'))
      }
      cb()
    })
    request.open('GET', './peerweb/status')
    request.send()
  }
})()
