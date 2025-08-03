import { extractTags } from './utils';
import { handleBetsOpen, handleGameResult, handleWinners } from './betting';
import { overwrideSocket } from './websocket';

export function parseAndHandleMessage(xml: string, socket: WebSocket, username: string) {
    const tags = extractTags(xml);

    const ignoreList = [
        'ping',
        'pong',
        'session',
        'gameresult',
        'winners',
        'command',
        'betsclosed',
        'betsclosingsoon',
        'betsopen',
        "game",
        "timer",
        "zoomIn",
        "startDealing",
        "StatisticHistory",
        "zoomOut",
        "table",
        "dealer",
        "subscribe",
        "sc",
        "win",
        "bets"
    ]

    for (const { name, attrs, content } of tags) {
        if (name === 'gameresult') handleGameResult(attrs, username);
        if (name === 'winners') handleWinners(attrs);
        if (name == "betsopen") handleBetsOpen(attrs, socket, username);
        if (name == "session") {
            console.log(`[🌐 WebSocket] Session: ${content}`);

            if (content == "offline") {
                overwrideSocket(username)
            }
        }

        if (
            !ignoreList.includes(name)
        ) {
            console.log(`[📬 Mensagem recebida] ${name} - Atributos:`, attrs);
        }
    }
}
