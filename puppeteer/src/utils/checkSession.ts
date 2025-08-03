import type { Page } from "puppeteer";

export async function checkSession(page: Page): Promise<boolean> {
    try {
        await page.locator("text/Cashier");
        return true; // User is logged in
    } catch (error) {
        return false; // User is not logged in
    }
}