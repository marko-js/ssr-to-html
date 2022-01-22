#!/usr/bin/env node

import arg from "arg";
import toHTML from ".";

const opts = arg(
  {
    "--out": String,
    "--port": Number,
    "--path": [String],
    "--404": String,
    "--help": Boolean,
    "-o": "--out",
    "-p": "--path",
    "-h": "--help",
  },
  { permissive: false, argv: process.argv.slice(2) }
);

if (opts["--help"]) {
  console.log(`
Usage
  $ ssr-to-html --out ./dist -- <cmd>

Options
  --out, -o  The directory that the ".html" files will be written to
  --port  The port of the server to connect to. This also sets "process.env.PORT" and defaults to a random available port
  --path, -p  An additional path to crawl (by default will crawl from /)
  --404  The path to the 404 page (default /404/)
  --help, -h  Shows this message

Examples
  $ ssr-to-html --out ./dist -- npm start
  $ ssr-to-html -o ./dist --port 3001 -- node/index.js
  $ ssr-to-html -o ./dist -p / -p /non-crawlable-path -- node ./index.js
`);
} else {
  (async () => {
    if (!opts["--out"]) {
      throw new Error(
        "The --dist option is required and specifies where files should be output."
      );
    }
    await toHTML({
      cmd: opts._.join(" "),
      out: opts["--out"],
      port: opts["--port"],
      paths: opts["--path"],
      notFoundPath: opts["--404"],
    });
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
