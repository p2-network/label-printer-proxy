import cookieParser from "cookie-parser";
import express, { json, urlencoded } from "express";
import handlebars from "handlebars";
import morgan from "morgan";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const app = express();
const port = 3000;

const host = process.env.DYMO_HOST ?? "127.0.0.1";

const getConfig = async () => {
  const configFileName = resolve("./config.json");
  const rawData = await readFile(configFileName);

  return JSON.parse(rawData.toString());
};

const config = await getConfig();

app.use(morgan("dev"));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(resolve("./public")));

app.get("/labels", (req, res) => {
  res.header("content-type", "application/json");
  res.send(config.labels);
});

const attemptPrint = async (printerName, labelXml) => {
  const body = new URLSearchParams({
    printerName,
    printParamsXml: "",
    labelXml,
    labelSetXml: ""
  });

  const output = await fetch(
    "https://" + host + ":41951/DYMO/DLS/Printing/PrintLabel",
    {
      body,
      cache: "default",
      credentials: "omit",
      headers: {
        Accept: "*/*",
        "Accept-Language": "en-AU,en;q=0.9",
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15"
      },
      method: "POST",
      mode: "cors",
      redirect: "follow",
      referrer: "http://localhost:9001/"
    }
  );

  // console.log("output", output);
  const outputText = await output.text();
  console.log("output text", outputText);
};

app.get("/printers", async (req, res) => {
  const printersRequest = await fetch(
    "https://" + host + ":41951/DYMO/DLS/Printing/GetPrinters"
  );
  const printersText = await printersRequest.text();

  res.send({ printersText });
});

app.post("/print", async (req, res) => {
  // TODO: input validation :)
  const { idx, tag } = req.body;

  const label = config.labels[parseInt(idx, 10)];

  if (!label) {
    res.status(404);
    res.send({ error: "Label not found" });
    return;
  }

  const labelFilePath = resolve(label.label);
  const templateData = await readFile(labelFilePath);

  const template = handlebars.default.compile(templateData.toString());

  const labelXml = template({
    qrDataString: `URL:https://a.twopats.live/${tag}`,
    qrDataURL: `https://a.twopats.live/${tag}`,
    labelText: tag
  });

  const x = await attemptPrint(label.printer, labelXml);

  res.send({ x });
});

app.post("/print2", async (req, res) => {
  // TODO: input validation :)
  const { idx, vars } = req.body;

  const label = config.labels[parseInt(idx, 10)];

  if (!label) {
    res.status(404);
    res.send({ error: "Label not found" });
    return;
  }

  const labelFilePath = resolve(label.label);
  const templateData = await readFile(labelFilePath);

  const template = handlebars.default.compile(templateData.toString());

  const labelXml = template({ ...(vars ?? {}) });

  await writeFile(labelFilePath + ".output.dymo", labelXml);

  const x = await attemptPrint(label.printer, labelXml);

  res.send({ x });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
