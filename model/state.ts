import mongoose, { Schema, Document } from 'mongoose';

export interface IState extends Document {
    history: string[];
    betAmount: number;
    baseBetAmount: number;
    inBetMode: boolean;
    lastColor: string;
    targetColor: string;
    startAfterNRepeats: number;
    userId: string;
    tableId: string;
    gameId: string;
    username: string;
    initial_balance: number; // campo adicionado
    ws_url: string; // novo campo
}

const StateSchema: Schema = new Schema({
    history: { type: [String], default: [] },
    betAmount: { type: Number, required: true },
    baseBetAmount: { type: Number, required: true },
    inBetMode: { type: Boolean, required: true },
    lastColor: { type: String, required: true },
    targetColor: { type: String, required: true },
    startAfterNRepeats: { type: Number, required: true },
    userId: { type: String, required: true },
    tableId: { type: String, required: true },
    gameId: { type: String, required: true },
    username: { type: String, required: true },
    ws_url: { type: String, required: true }, // novo campo
    initial_balance: { type: Number, required: true } // campo adicionado
});

export const userStates = mongoose.model<IState>('State', StateSchema);