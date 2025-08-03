import { userStates, type IState } from '../model/state';
import { getNewSocketUrl } from '../puppeteer/src';
import { parseAndHandleMessage } from './parser';
import { calculateMinimumBet } from './utils';

let socket: WebSocket;
let interval: NodeJS.Timeout;

export async function setupSocket(url: string, user: IState) {
	if (socket) {
		clearInterval(interval);
		socket.close();
	}
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
	await getNewSocketUrl(email);

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

	await getNewSocketUrl(email);

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
