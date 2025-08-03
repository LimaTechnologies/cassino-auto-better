import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Page, Browser, HTTPResponse, HTTPRequest } from "puppeteer";

puppeteer.use(StealthPlugin());

export class BrowserInstance {
    public sessionName: string
    private proxyServer: string | null = null;
    private headless: boolean = true

    public browser: Browser | null = null;
    public page: Page | null = null;

    constructor({
        sessionName,
        proxyServer,
        headless = true
    }: {
        sessionName: string,
        proxyServer?: string,
        headless: boolean
    }) {
        this.sessionName = sessionName;
        this.headless = headless;

        if (proxyServer) {
            this.proxyServer = proxyServer;
        }
    }

    private logUrl(url: string) {
        const parsedUrl = new URL(url);
        const ignoreList = [
            "cdn",
            "image",
            "static",
            "assets",
            "media",
            ".js",
            ".css",
        ]

        if (parsedUrl.protocol === 'data:') {
            return;
        }
        if (ignoreList.some(part => parsedUrl.pathname.includes(part))) {
            return;
        }
        if (ignoreList.some(part => parsedUrl.hostname.includes(part))) {
            return;
        }
    }

    async interceptWebsocketRequests(page: Page, listeners: { url: string, callback: (params: any) => void }[]) {
        const client = await page.target().createCDPSession()

        await client.send('Network.enable')

        client.on('Network.webSocketCreated', ({ requestId, url }) => {
            const listener = listeners.find(listener => url.includes(listener.url));

            if (listener) {
                listener.callback({
                    url: () => url
                });
            }
        })
    }

    async requestInterceptor(page: Page, listeners: { url: string, callback: (params: HTTPRequest) => void }[]) {
        await page.setRequestInterception(true);
        await this.interceptWebsocketRequests(page, listeners);

        page.on('request', async (request) => {
            request.continue();
            const url = request.url();

            this.logUrl(url);

            const listener = listeners.find(listener => url.includes(listener.url));

            if (listener) {
                await listener.callback(request);
            }
        })
    }

    async responseInterceptor(page: Page, listeners: { url: string, callback: (params: HTTPResponse) => void }[]) {
        await page.setRequestInterception(true);

        page.on('response', async (response) => {
            const url = response.url();

            this.logUrl(url);

            const listener = listeners.find(listener => url.includes(listener.url));

            if (listener) {
                await listener.callback(response);
            }
        })
    }

    async createBrowser() {
        const browser = await puppeteer.launch({
            headless: this.headless,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                this.proxyServer || ''
            ],
            executablePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
            userDataDir: './sessions/' + this.sessionName,
            timeout: 0
        });

        return browser
    }

    async init() {
        this.browser = await this.createBrowser();
    }
}