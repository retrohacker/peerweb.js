/*import WebTorrent from 'webtorrent/webtorrent.min' // or ./webtorrent
var client = new WebTorrent()

var torrentId = 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent'

client.add(torrentId, function (torrent) {
  // Torrents can contain many files. Let's use the .mp4 file
  var file = torrent.files.find(function (file) {
    return file.name.endsWith('.mp4')
  })

  // Display the file by adding it to the DOM. Supports video, audio, image, etc. files
  file.appendTo('body')
})*/

import WebTorrent from './webtorrent' // or ./webtorrent
import async from 'async'
import localforage from 'localforage'

const client = new WebTorrent()

let peerweb  = {}
peerweb.debug = true
peerweb.render = function peerWebRender (magnet) {
  if (peerweb.debug) console.log('Downloading torrent from', magnet)
  client.add(magnet, renderFromTorrent)
}

function renderFromTorrent (torrent) {
  if (peerweb.debug) console.log('Torrent Downloaded:')
  if (peerweb.debug) console.log(torrent)
  // Get index.html
  const index = torrent.files.find(function (file) {
    return file.name.endsWith('index.html')
  })
  console.log('termino')
  console.log(index)

  // Store each file in browser storage
  async.each(torrent.files, function (file, cb) {
    file.getBlobURL(function (e, bloburl) {
      if (e && peerweb.debug) console.log('Failed to get blob for', file.path, ':', e)
      if (e) return null
      console.log(bloburl)
      let path  = file.path.slice(torrent.dn.lenght)
      if (peerweb.debug) console.log('Adding', path, 'to browser storage')
      localforage.setItem(path, bloburl).then(function () { cb() }).catch(function (e) { cb(e) })
    })
  }, function (e) {
    if (e && peerweb.debug) console.log('Failed to add files to local storage', e)
    if (e) return null
    console.log('hecho')
    index.getBuffer(function (e, buffer) {
      if (e && peerweb.debug) console.log('Failed to get index.html buffer', e)
      if (e) return null
      //document.body.innerHTML = buffer.toString()
    })
    localforage.getItem("/pulpitrock.jpg").then(function(readValue) {
      console.log('Read: ', readValue);
    });
  })
}

peerweb.init = function peerwebInit (cb) {
  cb()
}


peerweb.init(function (e) {
  if(e) throw e
  peerweb.debug = true
  peerweb.render('magnet:?xt=urn:btih:ceeaced1aca41e46b23c595c46d8688fcb62070a&dn=page&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com')
})

console.log('iniciando')

