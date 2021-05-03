import fs from "fs";
import path from "path";
import crawl from "../index";

test("works", async () => {
  const getFiles = trackFS();
  await crawl({
    out: "/",
    cmd: nodeCMD("fixtures/simple-server.js")
  });
  expect(getFiles()).toMatchSnapshot();
});

function trackFS() {
  const {
    createWriteStream,
    promises: { mkdir }
  } = fs;
  const files: Record<string, string> = {};

  fs.promises.mkdir = ((() => Promise.resolve()) as unknown) as typeof mkdir;
  fs.createWriteStream = (((path: string) => {
    files[path] = "";
    return {
      write(data: string | Buffer) {
        files[path] += data.toString("utf-8");
      },
      end(data?: string | Buffer | undefined) {
        if (data) {
          this.write(data);
        }
      }
    };
  }) as unknown) as typeof createWriteStream;

  return () => {
    fs.createWriteStream = createWriteStream;
    fs.promises.mkdir = mkdir;
    return files;
  };
}

function nodeCMD(req: string) {
  return `node ${path.relative(process.cwd(), path.resolve(__dirname, req))}`;
}
