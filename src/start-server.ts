import net from "net";
import cp from "child_process";

export default async (
  cmd: string,
  port: number,
  wait: number
): Promise<() => void> => {
  const proc = cp.spawn(cmd, {
    shell: true,
    stdio: "inherit",
    windowsHide: true,
    env: { ...process.env, PORT: `${port}` },
  });

  const close = () => {
    proc.unref();
    proc.kill();
  };

  let remaining = wait > 0 ? wait : Infinity;
  while (!(await isPortInUse(port))) {
    if (remaining >= 100) {
      remaining -= 100;
      await sleep(100);
    } else {
      close();
      throw new Error(
        `site-write: timeout while wating for server to start on port "${port}".`
      );
    }
  }

  return close;
};

function isPortInUse(port: number) {
  return new Promise<boolean>((resolve) => {
    const connection = net
      .connect(port)
      .setNoDelay(true)
      .setKeepAlive(false)
      .on("error", () => done(false))
      .on("connect", () => done(true));
    function done(connected: boolean) {
      connection.end();
      resolve(connected);
    }
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
