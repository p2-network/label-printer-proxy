import handlebars from "handlebars";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

// grumble grumble node / dymo
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const host = process.env.DYMO_HOST ?? "127.0.0.1";

const printerName = "Dymo Label Writer 550 Turbo on DYMOLW550T223ff1E";
// const printerName = "DYMO Label Writer 5XL on DYMOLW5XL30c12dE";

// const labelName = resolve("./asset-large.dymo.hbs");
const labelName = resolve("./small.dymo.hbs");

const templateData = await readFile(labelName);

const template = handlebars.default.compile(templateData.toString());

if (process.argv.length < 3) {
  throw new Error("Usage: node test.mjs ASSET_ID");
}

const tag = process.argv[2];

const labelXml = template({
  qrDataString: `URL:https://a.twopats.live/${tag}`,
  qrDataURL: `https://a.twopats.live/${tag}`,
  labelText: tag,
});

const body = new URLSearchParams({
  printerName,
  printParamsXml: "",
  labelXml,
  labelSetXml: "",
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
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15",
    },
    method: "POST",
    mode: "cors",
    redirect: "follow",
    referrer: "http://localhost:9001/",
  }
);

// console.log("output", output);
const outputText = await output.text();
console.log("output text", outputText);
