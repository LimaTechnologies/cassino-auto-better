import type { Page } from "puppeteer";

export async function loginRollbit(page: Page, email: string, password: string) {
    await page
        .locator('text/Login')
        .click();

    await page
        .locator("input[name=\"email\"]")
        .fill(email);

    await page
        .locator("input[name=\"password\"]")
        .fill(password);

    await page.keyboard.press("Enter");
}

export async function loadUi(page: Page, ui_url: string) {
    await page.goto(ui_url)

    await page.waitForNetworkIdle({ idleTime: 100 })
}