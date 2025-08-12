import { BrowserInstance } from "./class/browser";
import { loadUi, loginRollbit } from "./utils/loginRollbit";
import { checkCaptcha, checkSession } from "./utils/checkSession";
import { cleanBrowser } from "./utils/clean";
import { scrapeWebSocket } from "./utils/scrape_ws";
import { userStates } from "../../model/state";
import { wait } from "../../src/websocket";


export async function getNewSocketUrl(email: string) {
    const client = new BrowserInstance({
        "sessionName": email,
        headless: false,
    })

    const rollbit = "https://rollbit.com/"

    const roullete = "https://rollbit.com/private/games/launch/pragmaticexternal:RouletteAzure"
    const roulleteUi = "https://rollbit.com/game/pragmaticexternal:RouletteAzure"

    console.log("[00] Abrindo browser")

    await client.init();

    await client.browser

    const user = await userStates.findOne({
        $or: [
            {
                login: email
            },
            {
                username: email
            }
        ]
    });

    if (!user) {
        throw new Error(`User with email ${email} not found`);
    }

    const password = user.password;

    const page = await client.browser?.newPage();

    if (page) {
        await loadUi(page, roulleteUi)

        await cleanBrowser(client);

        const scrapeParams = { page, client, roullete, user }

        try {
            await scrapeWebSocket(scrapeParams)
        } catch (err) {
            console.error(err)
            console.log("Usuario nao authenticado, logando")
            await page.goto(rollbit);

            await wait(2000)

            await loginRollbit(page, email, password);

            const captcha = await checkCaptcha(page)

            console.log("Captcha on?", captcha)

            // await scrapeWebSocket(scrapeParams)
            // resolver captcha depois

            await wait(1 * 60 * 1000)
        }

        await client.browser?.close()
    }
}