import { RouletteHistory } from '../model/history';
import { userStates } from '../model/state';
import { parseAndHandleMessage } from './parser';
import { WS_URL } from './state';

export async function setupWebSocket(username: string) {
  await userStates.findOneAndUpdate(
    {
      username: username
    },
    {
      history: [],
      inBetMode: false,
    }
  )

  const socket = new WebSocket(WS_URL);

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
