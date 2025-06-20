import { userStates } from '../model/state';
import { state } from './state';

export function colorToCode(color: string): string {
    if (color === 'red') return '48';    // vermelho
    if (color === 'black') return '49';  // preto
    if (color === 'green') return '50';  // verde
    return '0';
}

export async function sendBetCommand(gameId: string, username: string, socket: WebSocket) {
    const state = await userStates.findOne({
        username
    });

    if (!state) {
        console.error(`[❌ Erro] Estado do usuário não encontrado: ${username}`);
        return;
    }

    const timestamp = Date.now();
    const code = colorToCode(state.targetColor);

    const command =
        `<command channel="table-${state.tableId}">` +
        `<lpbet gm="roulette_desktop" gId="${gameId}" uId="${state.userId}" ck="${timestamp}">` +
        `<bet amt="${state.betAmount.toFixed(2)}" bc="${code}" ck="${timestamp}" />` +
        `</lpbet></command>`;

    socket.send(command);
    console.log(`[🎯 Apostando em ${state.targetColor}] €${state.betAmount.toFixed(2)} no jogo ${gameId}`);
}

export function calculateMinimumBet(balance: number): number {
    const minBet = Number((balance / Math.pow(2, 12)).toFixed(1));
    return Math.max(minBet, 0.1);
}

export function extractTags(xml: string): { name: string; attrs: Record<string, string>; content: string }[] {
    const tagPattern = /<([^!?\/\s>]+)([^>]*)>(.*?)<\/\1>|<([^!?\/\s>]+)([^>]*)\/?>/gs;
    const tags: { name: string; attrs: Record<string, string>; content: string }[] = [];
    let match;

    while ((match = tagPattern.exec(xml)) !== null) {
        const name = match[1] || match[4];
        const rawAttrs = match[2] || match[5] || '';
        const content = match[3] || '';

        const attrs: Record<string, string> = {};
        const attrPattern = /([a-zA-Z_:][\w:.-]*)=['"]([^'"]+)['"]/g;
        let attrMatch;
        while ((attrMatch = attrPattern.exec(rawAttrs)) !== null) {
            attrs[attrMatch[1]] = attrMatch[2];
        }

        tags.push({ name, attrs, content });
    }

    return tags;
}
