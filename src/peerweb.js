import WebTorrent from './webtorrent' // or 'webtorrent/webtorrent.min'
import async from 'async'

/* Mutation */
String.prototype.replaceAll = function (search, replacement) { return this.replace(new RegExp(search, 'g'), replacement) }
// Initalize WebTorrent
const client = new WebTorrent()
// Create class to export
export default class peerweb {
  constructor (debug = false) {
    this.debug = debug
  }
  render (magnet) {
    const that = this
    if (peerweb.debug) console.log('Downloading torrent from', magnet)
    client.add(magnet, function (torrent) {
      renderFromTorrent(torrent, that)
    })
  }
}

function renderFromTorrent(torrent, peerweb) {
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
      if (e && peerweb.debug)
        console.log('Failed to get blob for', file.path, ':', e)
      if (e) return null
      let path = file.path.slice(torrent.dn.length + 1)
      if (peerweb.debug) console.log('Adding', path, 'to browser storage')
      replaceObject[path] = bloburl
    })
  }, function (e) {
    if (e && peerweb.debug) console.log('Failed to add files to local storage', e)
    if (e) return null
    index.getBuffer(function (e, buffer) {
      if (e && peerweb.debug) console.log('Failed to get index.html buffer', e)
      if (e) return null
      let stringHTML = buffer.toString();
      for (let key in replaceObject) stringHTML = stringHTML.replaceAll(key, replaceObject[key])
      document.body.innerHTML = stringHTML
    })
  })
}