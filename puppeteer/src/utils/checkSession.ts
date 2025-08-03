import type { Page } from "puppeteer";

export async function checkSession(page: Page): Promise<boolean> {
    try {
        await page.locator("text/Cashier");
        return true; // User is logged in
    } catch (error) {
        return false; // User is not logged in
    }
}

export async function checkCaptcha(page: Page): Promise<boolean> {
    // Pega o frame do captcha (ajuste o filtro conforme o src ou url real do iframe)
    // const frames = page.frames();
    // const captchaFrame = frames.find(frame => frame.url().includes('google.com/recaptcha/api2'));
    // if (!captchaFrame) {
    //     console.log('Captcha iframe não encontrado');
    //     return false;
    // }

    // Procura se existe texto "Verify" ou "Skip" dentro do iframe
    const results = await Promise.allSettled([
        page.locator('text/Verify'),
        page.locator('text/Skip'),
    ]);
    const foundElement = results.some(r => r.status === 'fulfilled');

    return foundElement;
}