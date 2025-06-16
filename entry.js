const express = require("express");
const puppeteer = require("puppeteer");
const path = require("path");
const http = require("http");
const fs = require("fs");

const spriteSheetOptions = {
    head: "",
    clothes: "",
    jacket: "",
    vest: "",
    armour: "",
    shoulders: "",
    wrists: "",
    gloves: "",
    body: "",
    legs: "",
    shoes: "",
    hair: "",
};

function parseCommandLineArgs() {
    const args = process.argv.slice(2);

    if (args.includes("--help") || args.includes("-h")) {
        console.log("Usage: node entry.cjs [options]");
        console.log("Options:");
        console.log("  --head=<string>");
        console.log("  --clothes=<string>");
        console.log("  --jacket=<string>");
        console.log("  --vest=<string>");
        console.log("  --armour=<string>");
        console.log("  --shoulders=<string>");
        console.log("  --wrists=<string>");
        console.log("  --gloves=<string>");
        console.log("  --body=<string>");
        console.log("  --legs=<string>");
        console.log("  --shoes=<string>");
        console.log("  --hair=<string>");
        console.log("  --output=<string>    Output directory (default: downloads)");
        console.log("  --filename=<string>  Output filename (default: spritesheet.png)");
        process.exit(0);
    }

    for (const arg of args) {
        if (arg.startsWith("--")) {
            const [param, value] = arg.slice(2).split("=");
            if (param === "head") {
                spriteSheetOptions.head = value;
            } else if (param === "clothes") {
                spriteSheetOptions.clothes = value;
            } else if (param === "jacket") {
                spriteSheetOptions.jacket = value;
            } else if (param === "vest") {
                spriteSheetOptions.vest = value;
            } else if (param === "armour") {
                spriteSheetOptions.armour = value;
            } else if (param === "shoulders") {
                spriteSheetOptions.shoulders = value;
            } else if (param === "wrists") {
                spriteSheetOptions.wrists = value;
            } else if (param === "gloves") {
                spriteSheetOptions.gloves = value;
            } else if (param === "body") {
                spriteSheetOptions.body = value;
            } else if (param === "legs") {
                spriteSheetOptions.legs = value;
            } else if (param === "shoes") {
                spriteSheetOptions.shoes = value;
            } else if (param === "hair") {
                spriteSheetOptions.hair = value;
            } else if (param === "output") {
                spriteSheetOptions.outputDir = value;
            } else if (param === "filename") {
                spriteSheetOptions.filename = value;
            } else if (param in spriteSheetOptions) {
                if (!isNaN(value) && value !== "") {
                    if (Array.isArray(spriteSheetOptions[param])) {
                        spriteSheetOptions[param] = value.split(",").map(Number);
                    } else {
                        spriteSheetOptions[param] = Number(value);
                    }
                } else if (value === "true" || value === "false") {
                    spriteSheetOptions[param] = value === "true";
                } else {
                    spriteSheetOptions[param] = value;
                }
                console.log(`Setting ${param} to ${spriteSheetOptions[param]}`);
            }
        }
    }
}

parseCommandLineArgs();

const waitForServer = (port, timeout = 30000) => {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const checkServer = () => {
            const req = http.get(`http://localhost:${port}`, (res) => {
                if (res.statusCode === 200) {
                    resolve();
                } else {
                    reject(new Error(`Server returned status code ${res.statusCode}`));
                }
            });
            req.on("error", () => {
                if (Date.now() - startTime > timeout) {
                    reject(new Error("Server connection timeout"));
                } else {
                    setTimeout(checkServer, 1000);
                }
            });
        };
        checkServer();
    });
};

(async () => {
    const downloadPath = spriteSheetOptions.outputDir || path.resolve(__dirname, "downloads");
    if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath);
    }

    const app = express();
    app.use(express.static(path.join(__dirname)));
    const server = http.createServer(app);
    const PORT = 53214;

    try {
        await new Promise((resolve, reject) => {
            server.listen(PORT, (err) => {
                if (err) reject(err);
                else {
                    console.log(`Server started: http://localhost:${PORT}`);
                    resolve();
                }
            });
        });

        console.log("Waiting for server to be ready...");
        await waitForServer(PORT);
        console.log("Server is ready!");

        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();

        page.setDefaultNavigationTimeout(120000);
        page.setDefaultTimeout(120000);

        await page.setRequestInterception(true);
        page.on("request", (request) => {
            request.continue();
        });

        page.on("pageerror", (error) => console.error("[PAGE ERROR]", error));

        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
            try {
                console.log(`Attempting to load page (attempt ${retryCount + 1}/${maxRetries})...`);
                let url = `http://localhost:${PORT}/`;
                let params = "";
                for (const [key, value] of Object.entries(spriteSheetOptions)) {
                    if (value && key !== 'outputDir' && key !== 'filename') {
                        params += `&${key}=${value}`;
                    }
                }
                if (params) {
                    url += `#?${params.substring(1)}`; // Remove the first & character
                }
                console.log(url);

                await page.goto(url, {
                    waitUntil: ["networkidle0", "domcontentloaded"],
                    timeout: 120000,
                });

                await page.waitForSelector("#spritesheet", { timeout: 30000 });
                await page.waitForTimeout(2000);

                const canvasValid = await page.evaluate(() => {
                    const canvas = document.getElementById("spritesheet");
                    return canvas && canvas.width > 0 && canvas.height > 0;
                });

                if (!canvasValid) {
                    throw new Error("Canvas is not properly initialized");
                }

                // 使用浏览器原生下载功能
                await page.evaluate((filename) => {
                    const canvas = document.getElementById('spritesheet');
                    const pngDataUrl = canvas.toDataURL('image/png');
                    
                    const downloadLink = document.createElement('a');
                    downloadLink.href = pngDataUrl;
                    downloadLink.download = filename;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                }, spriteSheetOptions.filename || 'spritesheet.png');

                console.log('✅ Download initiated');

                // 等待下载完成
                await page.waitForTimeout(5000);

                await browser.close();
                server.close(() => {
                    console.log("Server closed.");
                    process.exit(0);
                });

                break;
            } catch (error) {
                retryCount++;
                if (retryCount === maxRetries) {
                    throw new Error(`Failed to load page after ${maxRetries} attempts: ${error.message}`);
                }
                console.log(`Navigation failed, retrying in 5 seconds...`);
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
        }
    } catch (err) {
        console.error("Error occurred:", err);
        process.exit(1);
    }
})();
