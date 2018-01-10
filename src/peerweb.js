import WebTorrent from './webtorrent' // or 'webtorrent/webtorrent.min'
import async from 'async'

/* Mutation */
String.prototype.replaceAll = function (search, replacement) { return this.replace(new RegExp(search, 'g'), replacement) }
// Initalize WebTorrent
const client = new WebTorrent()
// This is shorter
const { log, info } = console

// Create class to export
export default class peerweb {
  constructor (debug = false) {
    this.d = debug
  }
  debug (text) {
    if (this.d) log(text)
  }
  render (magnet) {
    const that = this
    this.debug('Downloading torrent from ' + magnet)
    client.add(magnet, function (torrent) {
      renderFromTorrent(torrent, that)
    })
  }
  getMagnet (files) {
    const { debug } = this
    return new Promise((resolve,reject) => {
      client.seed(files, torrent => {
        torrent.on('error', reject)
        debug(torrent)
        resolve(torrent.magnetURI)
      })
    })
  }
}

function renderFromTorrent(torrent, peerweb) {
  peerweb.debug('Torrent Downloaded:')
  peerweb.debug(torrent)
  // Get index.html
  const index = torrent.files.find(function (file) {
    return file.name.endsWith('index.html')
  })
  let replaceObject = {}
  // Store each file in browser storage
  async.each(torrent.files, function (file, cb) {
    file.getBlobURL(function (e, bloburl) {
      if (e && peerweb.d)
        log('Failed to get blob for', file.path, ':', e)
      if (e) return null
      let path = file.path.slice(torrent.dn.length + 1)
      if (peerweb.d) log('Adding', path, 'to browser storage')
      replaceObject[path] = bloburl
      cb() // not sure if needed
    })
  }, function (e) {
    if (e && peerweb.d) log('Failed to add files to local storage', e)
    if (e) return null
    peerweb.debug('Files added, will render index soon')
    index.getBuffer(function (e, buffer) {
      if (e && peerweb.d) log('Failed to get index.html buffer', e)
      if (e) return null
      // Add HTML
      renderHTML(buffer, replaceObject)
      // Evaluate JS
      evaluateJS()
    })
  })
}

function renderHTML(buffer, replaceObject) {
  let stringHTML = buffer.toString()
  for (let key in replaceObject) stringHTML = stringHTML.replaceAll(key, replaceObject[key])
  document.documentElement.innerHTML = stringHTML
}

function evaluateJS() {
  let scripts = document.getElementsByTagName('script')
  const { length } = scripts
  for (let i = 0; i < length; i++) { // Can't use .map because it's a HTMLCollection
    let scrpt = document.createElement('script')
    if (scripts[i].src) scrpt.src = scripts[i].src  
    if (scripts[i].innerHTML != '') scrpt.src = `data:text/js,${scripts[i].innerHTML };` // Tricky way to load js
    document.body.appendChild(scrpt)
    scripts[i].parentElement.removeChild(scripts[i]) // Remove duplication
  }
}