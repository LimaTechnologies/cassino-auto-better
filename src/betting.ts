import { RouletteHistory } from '../model/history';
import { userStates, type IState } from '../model/state';
import { calculateMinimumBet, sendBetCommand } from './utils';
import { overwrideSocket } from './websocket';

export async function handleBetsOpen(attrs: any, socket: WebSocket, username: string) {
	const state = await userStates.findOne({
		username
	});

	if (!state) {
		console.error(`[❌ Erro] Estado do usuário não encontrado: ${username}`);
		return;
	}

	const gameId = attrs.game;
	const tableId = attrs.table;

	await state.updateOne({
		gameId: gameId,
	})

	console.log(`[🎲 Apostas abertas] Jogo: ${gameId} | Mesa: ${tableId}`)

	const { history, lastColor } = state;
	const color = lastColor.toLowerCase();

	const lastN = history.slice(-state.startAfterNRepeats);
	const allSame = lastN.length === state.startAfterNRepeats && lastN.every(c => c === lastN[0]);

	const betAmount = calculateMinimumBet(state.initial_balance);

	if (!state.inBetMode && allSame) {
		const targetColor = getOppositeColor(lastN[0], lastColor);

		await state.updateOne({
			inBetMode: true,
			targetColor: targetColor,
			betAmount: betAmount,
			$inc: {
				initial_balance: -betAmount // subtrai o valor da aposta inicial
			}
		})

		sendBetCommand(gameId, username, socket);
		return;
	}

	if (state.inBetMode && color !== state.targetColor) {
		sendBetCommand(gameId, username, socket);
	}
};

async function checkWin(state: IState) {
	const newState = await userStates.findOne({
		username: state.username
	});

	if (!newState) {
		console.error(`[❌ Erro] Estado do usuário não encontrado: ${state.username}`);
		return;
	}

	state = newState;

	const { lastColor } = state;
	const color = lastColor.toLowerCase();

	if (state.inBetMode) {
		const won = color === state.targetColor;

		if (won) {
			console.log(`[✅ Vitória] Ganhamos com ${color}, resetando. Saldo: ${state.initial_balance + state.betAmount * 2}`);

			await state.updateOne({
				inBetMode: false,
				betAmount: calculateMinimumBet(state.initial_balance + (state.betAmount * 2)), // reinicia a aposta com o valor mínimo
				$inc: {
					initial_balance: state.betAmount * 2 // dobra o valor apostado
				}
			});

			await overwrideSocket(state.login);
		} else {
			await state.updateOne({
				betAmount: state.betAmount * 2,
				$inc: {
					initial_balance: -state.betAmount * 2 // subtrai o dobro do valor apostado
				}
			})

			console.log(`[🔁 Dobro] Ainda na sequência contrária, nova aposta: €${state.betAmount.toFixed(2)}`);
		}
	}
}

export async function handleGameResult(attrs: any, username: string) {
	const state = await userStates.findOne({
		username
	})

	if (!state) {
		console.error(`[❌ Erro] Estado do usuário não encontrado: ${username}`);
		return;
	}

	const color = attrs.color.toLowerCase();
	const { history } = state;

	history.push(color);
	if (history.length > 20) history.shift();

	console.log(`[🎨 Histórico] ${history.join(' → ')}`);

	await state.updateOne({
		lastColor: color,
		history: history
	});

	await checkWin(state);

	await RouletteHistory.create({ number: Number(attrs.score) })
}

function getOppositeColor(color: string, lastColor: string): string {
	if (color === 'red') return 'black';
	if (color === 'black') return 'red';
	return lastColor; // não aposta contra green
}

export function handleWinners(attrs: any) {
	console.log(`[💰 Ganhos Totais] Game ID: ${attrs.gId} | Total: €${attrs.totalEur}`);
}
