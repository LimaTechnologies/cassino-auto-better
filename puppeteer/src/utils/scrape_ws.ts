import { HTTPRequest, Page } from "puppeteer"
import type { BrowserInstance } from "../class/browser";
import { type IState } from "../../../model/state";
import { wait } from "../../../src/websocket";
import { updateUserBalance } from "./updateBalance";

let lastUpdate = 0
export const scrapeWebSocket = async ({
    page,
    client,
    roullete,
    user
}: {
    page: Page,
    client: BrowserInstance,
    roullete: string,
    user: IState
}) => {
    if (lastUpdate > Date.now() - (60 * 1000 * 60)) {
        return;
    }

    lastUpdate = Date.now()    
    let taskCompleted = false

    await updateUserBalance(page, user.username)

    await wait(1000)

    const res = await page.goto(roullete);

    let data: {
        game_url: string,
        strategy: string
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

                    taskCompleted = true
                }
            }
        }
    ])

    while (!taskCompleted) {
        await new Promise((res, rej) => {
            setTimeout(res, 100)
        })
    }
}