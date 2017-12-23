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
  console.log('termino')
  console.log(index)
  console.log(torrent.dn.length)
  // Store each file in browser storage
  async.each(torrent.files, function (file, cb) {
    file.getBlobURL(function (e, bloburl) {
      if (e && peerweb.debug) console.log('Failed to get blob for', file.path, ':', e)
      if (e) return null
      console.log(bloburl)
      let path  = file.path.slice(torrent.dn.length + 1)
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
      let stringHTML = buffer.toString()
      localforage.getItem("pulpitrock.jpg")
      .then(function(readValue) {
        console.log('Read: ', readValue);
        return stringHTML.replaceAll('pulpitrock.jpg', readValue)
      })
      .then((h)=> document.body.innerHTML = h)
      
    })
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
