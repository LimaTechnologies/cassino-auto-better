import { setupWebSocket } from './src/websocket';
import { connect } from "mongoose"

connect(process.env.MONGO_URL!)
    .then(() => {
        console.log('[🟢 Conectado ao MongoDB]');

        console.log('[🟢 Inicializando bot de roleta]');
        setupWebSocket("joaovitor_rlima@hotmail.com");
    })
    .catch(err => {         
        console.error('[🔴 Erro ao conectar ao MongoDB]', err)
    })