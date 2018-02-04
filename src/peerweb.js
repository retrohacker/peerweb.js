import WebTorrent from './webtorrent' // or 'webtorrent/webtorrent.min'
import async from 'async'
var Buffer = require('buffer/').Buffer 

/* Mutation */
String.prototype.replaceAll = function (search, replacement) { return this.replace(new RegExp(search, 'g'), replacement) }
// Initalize WebTorrent
const client = new WebTorrent()
// This is shorter
const { log, info } = console
const announce = ['wss://tracker.fastcast.nz',
'wss://tracker.openwebtorrent.com',
'wss://tracker.btorrent.xyz'
]
// Create class to export
export default class Peerweb {
  constructor (debug = false, name = 'defaultapp') {
    this.d = debug
    this.hash = new Buffer(20).fill(name)
    this.peers = []
    this._discoverPeers()
    this.sites = []
    this.publish = this.publish.bind(this)
    this.render = this.render.bind(this)
  }
  debug (text) {
    if (this.d) info(text)
  }
  publish (page) {
    this.broadcast({addSite: page})
  }
  render (magnet) {
    this.debug('Downloading torrent from ' + magnet)
    client.add(magnet, torrent => {
      //renderFromTorrent(torrent, this)
      this.publish({name:'test', magnetURI: magnet})
    })
  }
  getMagnet (name, files) {
    const debug = this.debug.bind(this)
    return new Promise((resolve,reject) => {
      client.seed(files, torrent => {
        torrent.on('error', reject)
        debug(torrent)
        const { magnetURI } = torrent 
        this.publish({name, magnetURI})
        resolve(magnetURI)
      })
    })
  }
  broadcast (obj) {
    this.peers.forEach(function (peer) {
      if (peer.connected) peer.send(JSON.stringify(obj))
    })
  }
  _getTracker (opts) {
    return new client.Discovery(opts)
  }
  get tracker () {
    return this._getTracker({
      infoHash: this.hash,
      peerId: client.peerId,
      announce
    })
  }
  _discoverPeers () {
    this.tracker.on('peer', peer => onPeer(peer, this))
  }
}

function renderFromTorrent (torrent, peerweb) {
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
      if (e && peerweb.d) log('Failed to get blob for', file.path, ':', e)
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

function renderHTML (buffer, replaceObject) {
  let stringHTML = buffer.toString()
  for (let key in replaceObject) stringHTML = stringHTML.replaceAll(key, replaceObject[key])
  document.documentElement.innerHTML = stringHTML
}

function evaluateJS () {
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

function onPeer (peer, self) {
  let { peers, sites, broadcast} = self
  if (included(peers, peer)) return undefined
  peers.push(peer)
  if (peer.connected) onConnect()
  else peer.once('connect', onConnect)
  function onConnect () {
    peer.on('data', onMessage)
    peer.on('close', onClose)
    peer.on('error', onClose)
    peer.on('end', onClose)
    if (sites == []) {
      broadcast({ isEmpty: true})
    }
  }
  function onClose () {
    peer.removeListener('data', onMessage)
    peer.removeListener('close', onClose)
    peer.removeListener('error', onClose)
    peer.removeListener('end', onClose)
    peers.splice(peers.indexOf(peer), 1)
  }

  function onMessage (data) {
    try {
      data = JSON.parse(data)
    } catch (err) {
      console.error(err.message)
    }
    if (data.isEmpty && sites != []) {
      peer.send(JSON.stringify({ addSite: sites }))
    }
    if (sites == [] && data.sites) {
      sites = data.sites
    }
    if (data.addSite) {
      sites.push(data.addSite)
    }
  }

  /*
  if (peer.connected) onConnect()
  else peer.once('connect', onConnect)
  function onConnect () {
    peer.on('data', onMessage)
    peer.on('close', onClose)
    peer.on('error', onClose)
    peer.on('end', onClose)
    peer.send(JSON.stringify({ page }))
  
    function onClose () {
      peer.removeListener('data', onMessage)
      peer.removeListener('close', onClose)
      peer.removeListener('error', onClose)
      peer.removeListener('end', onClose)
      peers.splice(peers.indexOf(peer), 1)
    }
  
    function onMessage (data) {
      try {
        data = JSON.parse(data)
      } catch (err) {
        console.error(err.message)
      }
      log(data)
    }
  }
 */
}


function included (peers, peer) {
  let bol = false
  peers.map(p => {
    if (p.id == peer.id) bol = true
  })
  return bol
}