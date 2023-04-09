import handlebars from "handlebars";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

// grumble grumble node / dymo
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const host = process.env.DYMO_HOST ?? "localhost";

const printersRequest = await fetch(
  "https://" + host + ":41951/DYMO/DLS/Printing/GetPrinters"
);
const printersText = await printersRequest.text();

console.log("said", printersText);
