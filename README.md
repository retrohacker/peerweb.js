# PeerWeb.js

[![Code Climate](https://codeclimate.com/github/Yhozen/steemsites/badges/gpa.svg?style=flat-square)](https://codeclimate.com/github/Yhozen/steemsites)
[![Dependency Status](https://david-dm.org/Yhozen/peerweb.js.svg?style=flat-square)](https://david-dm.org/Yhozen/peerweb.js)
[![devDependency Status](https://david-dm.org/Yhozen/peerweb.js/dev-status.svg?style=flat-square)](https://david-dm.org/Yhozen/peerweb.js#info=devDependencies)
 [![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com)
 [![npm](https://img.shields.io/npm/l/peerweb.svg?style=flat-square)](https://npmjs.com/package/peerweb)
[![npm](https://img.shields.io/npm/dm/peerweb.svg?style=flat-square)](https://npmjs.com/package/peerweb)

A package to download and render a decentralised webpage thanks to WebTorrent. It's in alpha so a lot of bugs are expected.

## Install via [npm](https://npmjs.com)

```sh
$ npm install --save peerweb
```

## Usage
Build a simple static webpage and then create a torrent (instant.io for simplicity) with the whole folder like the following example
```
├── js
│   ├── main.js
│   └── other.js
├── imgs
│   ├── foo.png
│   └── bar.png
├── css
│   └── main.css
└── index.html
```
get the magnet link and then use it in a webpage like this
```js
import PeerWeb  from 'peerweb'

const peerweb = new PeerWeb(true) // true for debug

peerweb.render(YOUR_MAGNET_LINK)
```
## Contribute

Feel free to create pull request and issues with bugs or feature request. There are tons of features planned as render index faster, do not redownload files... etc. 
