import { RouletteHistory } from '../model/history';
import { userStates } from '../model/state';
import { parseAndHandleMessage } from './parser';
import { WS_URL } from './state';
import { calculateMinimumBet } from './utils';

export async function setupWebSocket(username: string) {
  const user = await userStates.findOne({
    username: username
  });
  await userStates.findOneAndUpdate(
    {
      username: username
    },
    {
      history: [],
      inBetMode: false,
      baseBetAmount: user?.initial_balance ? calculateMinimumBet(user.initial_balance) : 0.4,
    }
  )

  const socket = new WebSocket(user?.ws_url!);

  socket.onopen = () => {
    console.log('[🌐 WebSocket conectado]');
  };

  socket.onmessage = (event) => {
    parseAndHandleMessage(event.data, socket, username);
  };

  setInterval(() => {
    const ping = `<ping time='${Date.now()}'/>`;
    socket.send(ping);
  }, 10000);
}
