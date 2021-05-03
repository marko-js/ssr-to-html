import net from "net";
import cp from "child_process";

export default async (cmd: string, port: number): Promise<() => void> => {
  const proc = cp.spawn(cmd, {
    shell: true,
    stdio: "inherit",
    windowsHide: true,
    env: { ...process.env, PORT: `${port}` }
  });

  const close = () => {
    proc.unref();
    proc.kill();
  };

  let tries = 0;
  while (!(await isPortInUse(port))) {
    if (++tries === 50) {
      close();
      throw new Error(
        `site-write: timeout while wating for server to start on port "${port}".`
      );
    }
    await sleep(100);
  }

  return close;
};

function isPortInUse(port: number) {
  return new Promise<boolean>(resolve => {
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
  return new Promise(resolve => setTimeout(resolve, ms));
}
