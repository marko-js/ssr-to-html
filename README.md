<h1 align="center">
  <!-- Logo -->
  <br/>
  ssr-to-html
	<br/>

  <!-- Language -->
  <a href="http://typescriptlang.org">
    <img src="https://img.shields.io/badge/%3C%2F%3E-typescript-blue.svg" alt="TypeScript"/>
  </a>
  <!-- Format -->
  <a href="https://github.com/prettier/prettier">
    <img src="https://img.shields.io/badge/styled_with-prettier-ff69b4.svg" alt="Styled with prettier"/>
  </a>
  <!-- CI -->
  <a href="https://github.com/marko-js/ssr-to-html/actions/workflows/ci.yml">
    <img src="https://github.com/marko-js/ssr-to-html/actions/workflows/ci.yml/badge.svg" alt="Build status"/>
  </a>
  <!-- Coverage -->
  <a href="https://codecov.io/gh/marko-js/ssr-to-html">
    <img src="https://codecov.io/gh/marko-js/ssr-to-html/branch/main/graph/badge.svg?token=TODO"/>
  </a>
  <!-- NPM Version -->
  <a href="https://npmjs.org/package/ssr-to-html">
    <img src="https://img.shields.io/npm/v/ssr-to-html.svg" alt="NPM Version"/>
  </a>
  <!-- Downloads -->
  <a href="https://npmjs.org/package/ssr-to-html">
    <img src="https://img.shields.io/npm/dm/ssr-to-html.svg" alt="Downloads"/>
  </a>
</h1>

Crawl a server rendered application and output html files.

# Installation

```console
npm install ssr-to-html
```

# Usage

```terminal
$ ssr-to-html --out <directory> -- <cmd>
```

# Examples

```terminal
$ ssr-to-html --out ./dist -- npm start
```

The above will execute the `npm start` command and wait for a server to begin listening.
Once the server has started, we crawl the site starting from `/` and output `.html` files in the `./dist` directory.

# Options

- `--out, -o` The directory that the ".html" files will be written to
- `--port` The port of the server to connect to. This also sets `process.env.PORT` and defaults to a random available port
- `--path, -p` An additional path to crawl (by default will crawl from /)
- `--404` The path to the 404 page (default /404/)
- `--help, -h` Shows helpful information

# Code of Conduct

This project adheres to the [eBay Code of Conduct](./.github/CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.
