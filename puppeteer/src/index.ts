import { BrowserInstance } from "./class/browser";
import { connect } from "mongoose"
import { loginRollbit } from "./utils/loginRollbit";
import { checkSession } from "./utils/checkSession";
import { cleanBrowser } from "./utils/clean";
import { scrapeWebSocket } from "./utils/scrape_ws";
import { userStates } from "../../model/state";

const rollbit = "https://rollbit.com/"

const client = new BrowserInstance({
    "sessionName": "default-session",
    headless: false,
})

await connect(process.env.MONGO_URL!)

await client.init();

await client.browser

const users = await userStates.find({
    login: { $exists: true },
    password: { $exists: true },
})

const roullete = "https://rollbit.com/private/games/launch/pragmaticexternal:RouletteAzure"

for (const user of users) {
    const email = user.login;
    const password = user.password;

    const page = await client.browser?.newPage();

    if (page) {
        await cleanBrowser(client);

        await page.goto(rollbit);

        await page.waitForNetworkIdle({ idleTime: 2000 })

        let isLoggedIn = await checkSession(page);

        if (!isLoggedIn) await loginRollbit(page, email, password);

        await scrapeWebSocket({
            page,
            client,
            roullete,
            user
        })
    }
}