import { userStates, type IState } from '../model/state';
import { getNewSocketUrl } from '../puppeteer/src';
import { parseAndHandleMessage } from './parser';
import { calculateMinimumBet } from './utils';

let socket: WebSocket;
let interval: NodeJS.Timeout;

export async function wait(ms: number) {
	return new Promise((res, rej) => setTimeout(res, ms))
}

export async function handleNewSocket(email: string) {
	if (socket) {
		clearInterval(interval);
		socket.close();
	}

	console.log("[!!] Desconectando sessão e timeout antigos")

	await getNewSocketUrl(email);
}

export async function setupSocket(url: string, user: IState) {
	socket = new WebSocket(url);

	socket.onopen = () => {
		console.log('[🌐 WebSocket conectado]');
	};

	socket.onmessage = (event) => {
		parseAndHandleMessage(event.data, socket, user.username);
	};

	interval = setInterval(() => {
		const ping = `<ping time='${Date.now()}'/>`;
		socket.send(ping);
	}, 10000);
}

export async function overwrideSocket(email: string) {
	await handleNewSocket(email)

	const user = await userStates.findOne({
		login: email
	});

	if (!user) {
		console.error(`[❌ Erro] Usuário não encontrado: ${email}`);
		return;
	}

	setupSocket(user.ws_url, user);
}

export async function setupWebSocket(email: string) {
	const user = await userStates.findOne({
		login: email
	});

	if (!user) {
		console.error(`[❌ Erro] Usuário não encontrado: ${email}`);
		return;
	}

	await handleNewSocket(email)

	await userStates.findOneAndUpdate(
		{
			username: user.username
		},
		{
			history: [],
			inBetMode: false,
			baseBetAmount: user?.initial_balance ? calculateMinimumBet(user.initial_balance) : 0.4,
		}
	)

	setupSocket(user.ws_url, user);
}
