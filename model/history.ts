import mongoose, { Schema, Document, model } from 'mongoose';

export type RouletteColor = 'red' | 'black' | 'green';
export type RouletteFamily = 'low' | 'high' | 'zero';

export interface RouletteHistoryEntry extends Document {
    number: number;
    color: RouletteColor;
    family: RouletteFamily;
    timestamp: Date;
}

export const RouletteHistorySchema = new Schema<RouletteHistoryEntry>({
    number: { type: Number, required: true },
    color: { type: String, enum: ['red', 'black', 'green'] },
    family: { type: String, enum: ['low', 'high', 'zero'] },
    timestamp: { type: Date, default: Date.now }
});

// Accurate color mapping for European roulette
const colorMap: { [key: number]: RouletteColor } = {
    0: 'green',
    1: 'red',
    2: 'black',
    3: 'red',
    4: 'black',
    5: 'red',
    6: 'black',
    7: 'red',
    8: 'black',
    9: 'red',
    10: 'black',
    11: "black",
    12: 'red',
    13: 'black',
    14: 'red',
    15: 'black',
    16: 'red',
    17: 'black',
    18: 'red',
    19: 'red',
    20: 'black',
    21: 'red',
    22: 'black',
    23: 'red',
    24: 'black',
    25: 'red',
    26: 'black',
    27: 'red',
    28: 'black',
    29: 'black',
    30: 'red',
    31: 'black',
    32: 'red',
    33: 'black',
    34: 'red',
    35: 'black',
    36: 'red'
};

function getColor(number: number): RouletteColor {
    return colorMap[number] || 'black'; // Default to black if number not found (shouldn't happen with valid input)
}

// Family logic remains the same
function getFamily(number: number): RouletteFamily {
    if (number === 0) return 'zero';
    return number <= 18 ? 'low' : 'high';
}


// Middleware to assign color, family, and zone automatically
RouletteHistorySchema.pre('validate', function (next) {
    if (this.isNew) {
        this.color = getColor(this.number);
        this.family = getFamily(this.number);
    }
    next();
});

export const RouletteHistory = model<RouletteHistoryEntry>('RouletteHistory', RouletteHistorySchema);