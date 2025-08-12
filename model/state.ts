import mongoose, { Schema, Document } from 'mongoose';

export interface IState extends Document {
    history: string[];
    betAmount: number;
    baseBetAmount: number;
    lastColor: string;
    startAfterNRepeats: number;
    userId: string;
    tableId: string;
    gameId: string;
    username: string;
    initial_balance: number;
    ws_url: string;
    login: string;
    password: string;
    // Novos campos para controle do gale/martingale
    galeActive: boolean;
    galeTargetColor: string;
    galeBetAmount: number;
    aguardandoAlternancia: boolean;
}

const StateSchema: Schema = new Schema({
    history: { type: [String], default: [] },
    betAmount: { type: Number, required: true },
    baseBetAmount: { type: Number, required: true },
    lastColor: { type: String, required: true },
    startAfterNRepeats: { type: Number, required: true },
    userId: { type: String, required: true },
    tableId: { type: String, required: true },
    gameId: { type: String, required: true },
    username: { type: String, required: true },
    ws_url: { type: String, required: true },
    initial_balance: { type: Number, required: true },
    login: { type: String, required: true },
    password: { type: String, required: true },
    // Novos campos para controle do gale/martingale
    galeActive: { type: Boolean, default: false },
    galeTargetColor: { type: String, default: '' },
    galeBetAmount: { type: Number, default: 0 },
    aguardandoAlternancia: { type: Boolean, default: false }
});

export const userStates = mongoose.model<IState>('State', StateSchema);