import { get } from 'mongoose';
import { RouletteHistory } from '../model/history';
import { userStates, type IState } from '../model/state';
import { calculateMinimumBet, sendBetCommand } from './utils';
import { overwrideSocket } from './websocket';

export async function handleBetsOpen(attrs: any, socket: WebSocket, username: string) {
	const state = await userStates.findOne({ username });
	if (!state) {
		console.error(`[❌ Erro] Estado do usuário não encontrado: ${username}`);
		return;
	}

	const gameId = attrs.game;
	const tableId = attrs.table;
	console.log(`[🎲 Apostas abertas] Jogo: ${gameId} | Mesa: ${tableId}`);

	const { lastColor } = state;

	if (state.galeActive) {
		return sendBetCommand({
			color: getOppositeColor(lastColor, lastColor),
			gameId,
			socket,
			username
		});
	}
}

async function checkWin(state: IState) {
	const newState = await userStates.findOne({ username: state.username });
	if (!newState) {
		console.error(`[❌ Erro] Estado do usuário não encontrado: ${state.username}`);
		return;
	}
	state = newState;
	const { lastColor } = state;
	const color = lastColor?.toLowerCase();
	const allowBets = !(newState.history.slice(-2).every(c => c === lastColor));

	console.log(`[🎨 Apostas Permitidas] ${allowBets ? 'Sim' : 'Não'}`);

	if (state.galeActive) {
		const won = color === state.galeTargetColor;
		
		if (won) {
			console.log(`[✅ Vitória] Ganhamos com ${color}, resetando. Saldo: ${state.initial_balance + state.galeBetAmount * 2}`);
			await state.updateOne({
				galeBetAmount: calculateMinimumBet(state.initial_balance + (state.galeBetAmount * 2)),
				$inc: { initial_balance: state.galeBetAmount * 2 },
				galeTargetColor: getOppositeColor(color, state.lastColor),
			});
			await overwrideSocket(state.login);
		} else {
			const nextBet = state.galeBetAmount * 2;
			if (state.initial_balance >= nextBet) {
				await state.updateOne({
					galeActive: false,
					galeBetAmount: nextBet,
					$inc: { initial_balance: -nextBet }
				});
				console.log(`[🔁 Dobro] Ainda na sequência contrária, nova aposta: €${nextBet.toFixed(2)}`);
			} else {
				await state.updateOne({
					galeActive: false,
					galeBetAmount: calculateMinimumBet(state.initial_balance),
					aguardandoAlternancia: false,
				});
				console.log(`[❌ Fim do ciclo] Saldo insuficiente para dobrar. Resetando ciclo.`);
			}
		}
	} else if (allowBets) {
		await newState.updateOne({
			galeActive: true
		})
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
