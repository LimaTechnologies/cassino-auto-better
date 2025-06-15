import { setupWebSocket } from './src/websocket';
import { connect } from "mongoose"

connect(process.env.MONGO_URL!)
    .then(() => {
        console.log('[🟢 Conectado ao MongoDB]');

        console.log('[🟢 Inicializando bot de roleta]');
        setupWebSocket("lkz");
    })
    .catch(err => {
        console.error('[🔴 Erro ao conectar ao MongoDB]', err)
    })