import type { Page } from "puppeteer";
import { userStates } from "../../../model/state";
import { wait } from "../../../src/websocket";

export async function updateUserBalance(page: Page, user: string) {
    await page.goto("https://rollbit.com/account/balances")

    await wait(2000)

    const userBalance: number | null = await page.evaluate(() => {
        const results: string[] = [];

        function scanNode(node: Node): void {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = (node.textContent || '').trim();
                if (text.startsWith('$')) {
                    results.push(text);
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const children = node.childNodes;
                for (let i = 0; i < children.length; i++) {
                    scanNode(children[i]);
                }
            }
        }

        scanNode(document.body);

        const numbers: number[] = results
            .map(text => Number(text.replace('$', '').replace(',', '').trim()))
            .filter(n => !isNaN(n));

        const countMap = new Map<number, number>();
        for (const num of numbers) {
            countMap.set(num, (countMap.get(num) || 0) + 1);
        }

        // Pega o primeiro número que aparece 3 ou mais vezes
        for (const [num, count] of countMap.entries()) {
            if (count >= 3) {
                return num;
            }
        }

        // Se nenhum valor repetido 3x, retorna null
        return null;
    });

    await userStates.updateOne(
        {
            $or: [
                {
                    login: user
                },
                {
                    username: user
                }
            ]
        },
        {
            initial_balance: userBalance
        }
    )
}