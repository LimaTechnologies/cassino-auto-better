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
    console.log("[00] Carregando Ui da rollbit")
    await page.goto(ui_url)
    console.log("[01] Esperando urls")
    await page.waitForNetworkIdle({ idleTime: 2000 })
    console.log("[01-OK] Espera finalizada")
}