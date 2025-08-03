import { HTTPRequest, Page } from "puppeteer"
import type { BrowserInstance } from "../class/browser";

export const scrapeWebSocket = async ({
    page,
    client,
    roullete,
    user
}: {
    page: Page,
    client: BrowserInstance,
    roullete: string,
    user: { updateOne: (data: { ws_url: string }) => Promise<void> }
}) => {
    const res = await page.goto(roullete);

    const data: {
        game_url: string;
        strategy: string;
    } = await res?.json();

    await page.goto(data.game_url);

    client.requestInterceptor(page, [
        {
            url: "JSESSIONID",
            callback: async (res: HTTPRequest) => {
                if (res.url().includes("&tableId=g03y1t9vvuhrfytl")) {
                    await user.updateOne({
                        ws_url: res.url(),
                    })
                }
            }
        }
    ])
}