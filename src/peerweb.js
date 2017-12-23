import WebTorrent from './webtorrent' // or ./webtorrent
import async from 'async'
import localforage from 'localforage'

/* Mutation */
String.prototype.replaceAll = function (search, replacement) { return this.replace(new RegExp(search, 'g'),replacement)}
// Initalize WebTorrent
const client = new WebTorrent()
// Create object to export
let peerweb  = {}
peerweb.debug = true // True if developing
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
  let replaceObject = {}
  // Store each file in browser storage
  async.each(torrent.files, function (file, cb) {
    file.getBlobURL(function (e, bloburl) {
      if (e && peerweb.debug) console.log('Failed to get blob for', file.path, ':', e)
      if (e) return null
      let path  = file.path.slice(torrent.dn.length + 1)
      if (peerweb.debug) console.log('Adding', path, 'to browser storage')
      localforage.setItem(path, bloburl)
      .then(() => {
        replaceObject[path] = bloburl
        cb()
      })
      .catch(cb)
    })
  }, function (e) {
    if (e && peerweb.debug) console.log('Failed to add files to local storage', e)
    if (e) return null
    console.log(replaceObject)
    index.getBuffer(function (e, buffer) {
      if (e && peerweb.debug) console.log('Failed to get index.html buffer', e)
      if (e) return null
      let stringHTML = buffer.toString()
      for (let key in replaceObject) {
        stringHTML = stringHTML.replaceAll(key, replaceObject[key])
      }
      document.body.innerHTML = stringHTML
    })
  })
}

peerweb.render('magnet:?xt=urn:btih:760682a76de62478622298117f60fc39f7784cf6&dn=page&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com')