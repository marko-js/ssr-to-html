require("http")
  .createServer((req, res) => {
    switch (req.url) {
      case "/":
        sendHTML(res, 200, "<h1>Hi! <a href='/bye'>Bye!");
        break;
      case "/bye/":
        sendHTML(res, 200, "<h1>Bye!");
        break;
      default:
        sendHTML(res, 404, "<h1>404");
        break;
    }
  })
  .listen(process.env.PORT);

function sendHTML(res, code, html) {
  res.statusCode = code;
  res.setHeader("content-type", "text/html");
  res.end(`<!DOCTYPE html>${html}`);
}
