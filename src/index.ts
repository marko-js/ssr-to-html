import fs from "fs";
import net from "net";
import nodePath from "path";
import { Pool } from "undici";
import { Parser } from "htmlparser2";
import { AbortController } from "abort-controller";
import startServer from "./start-server";
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
const ignoredRels = new Set(["nofollow", "enclosure", "external"]);
const contentType = "text/html";

interface Options {
  out: string;
  cmd: string;
  port?: number;
  paths?: string[];
  notFoundPath?: string;
}

export default async function crawl(opts: Options): Promise<void> {
  const { port = await getAvailablePort() } = opts;
  const origin = `http://localhost:${port}`;
  const closeServer = await startServer(opts.cmd, port);
  const out = nodePath.resolve(opts.out);
  const notFoundPath = resolvePath(opts.notFoundPath || "/404/", origin)!;
  const startPaths = opts.paths
    ? (opts.paths
        .map((path) => resolvePath(path, origin))
        .concat(notFoundPath) as string[])
    : ["/", notFoundPath];
  const seen = new Set(startPaths);
  const client = new Pool(origin);
  let queue: Promise<void>[];

  try {
    queue = startPaths.map(visit);

    while (queue.length) {
      const pending = Promise.all(queue);
      queue = [];
      await pending;
    }
  } finally {
    closeServer();
    await client.close();
  }

  async function visit(path: string) {
    const parser = new Parser({
      onopentag(name, attrs) {
        const href = resolveHref(name, attrs);
        const path = href && resolvePath(href, origin);

        if (path !== undefined && !seen.has(path)) {
          seen.add(path);
          queue.push(visit(path));
        }
      },
    });

    const dirname = nodePath.join(out, path);
    const abortController = new AbortController();
    let fsWriter: fs.WriteStream | undefined;

    try {
      const res = await client.request({
        path,
        method: "GET",
        signal: abortController.signal,
        headers: { accept: contentType },
      });

      if (!res.headers["content-type"]?.includes(contentType)) {
        res.body.on("error", noop);
        abortController.abort();
        return;
      }

      let redirect: string | undefined;

      switch (res.statusCode) {
        case 200:
          break;
        case 404:
          if (path !== notFoundPath) {
            redirect = origin + notFoundPath;
          }
          break;
        case 301: {
          redirect = res.headers.location!;
          const redirectPath = resolvePath(redirect, origin);

          if (redirectPath && !seen.has(redirectPath)) {
            seen.add(redirectPath);
            queue.push(visit(redirectPath));
          }
          break;
        }
        default:
          res.body.on("error", noop);
          abortController.abort();
          throw new Error(
            `Unexpected status code ${res.statusCode} was discovered while crawling.`
          );
      }

      await fs.promises.mkdir(dirname, { recursive: true }).catch(noop);
      fsWriter = fs.createWriteStream(nodePath.join(dirname, "index.html"));

      if (redirect) {
        res.body.on("error", noop);
        abortController.abort();
        fsWriter.write(
          `<!DOCTYPE html><meta http-equiv=Refresh content="0;url=${redirect.replace(
            /"/g,
            "&#40;"
          )}">`
        );
      } else {
        for await (const data of res.body) {
          fsWriter.write(data);
          parser.write(data);
        }
      }
    } finally {
      fsWriter?.end();
      parser.end();
    }
  }
}

function resolveHref(tagName: string, attrs: Record<string, string>) {
  switch (tagName) {
    case "a":
      if (attrs.href && !(attrs.download || ignoredRels.has(attrs.rel))) {
        return attrs.href;
      }
      break;
    case "link":
      if (attrs.href) {
        switch (attrs.rel) {
          case "alternate":
          case "author":
          case "canonical":
          case "help":
          case "license":
          case "next":
          case "prefetch":
          case "prerender":
          case "prev":
          case "search":
          case "tag":
            return attrs.href;
          case "preload":
            if (attrs.as === "document") {
              return attrs.href;
            }
            break;
        }
      }
      break;
    case "iframe":
      return attrs.src;
  }
}

function resolvePath(href: string, origin: string) {
  const url = new URL(href, origin);
  if (url.origin === origin) {
    let { pathname } = url;
    const lastChar = pathname.length - 1;
    if (pathname[lastChar] !== "/") {
      pathname += "/";
    }
    return pathname + url.search;
  }
}

async function getAvailablePort() {
  return new Promise<number>((resolve) => {
    const server = net.createServer().listen(0, () => {
      const { port } = server.address() as net.AddressInfo;
      server.close(() => resolve(port));
    });
  });
}
