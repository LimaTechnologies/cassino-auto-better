import { BrowserInstance } from "../class/browser"

export async function cleanBrowser(client: BrowserInstance) {
    const pages = await client.browser?.pages();
    if (pages && pages.length > 1) {
        for (let i = 0; i < pages.length - 1; i++) {
            await pages[i].close();
        }
    }
}