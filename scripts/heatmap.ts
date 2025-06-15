import { connect } from "mongoose"
import { RouletteHistory } from "../model/history";

const circularMap = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

type HeatMap = Record<number, number>;

const heat: HeatMap = Object.fromEntries(circularMap.map(n => [n, 0]));

function hitNumber(num: number) {
    const idx = circularMap.indexOf(num);
    if (idx === -1) return;

    heat[num] += 3;

    for (let offset = 1; offset <= 4; offset++) {
        const leftIdx = (idx - offset + circularMap.length) % circularMap.length;
        const rightIdx = (idx + offset) % circularMap.length;
        const inc = offset === 4 ? 1 : 2;

        heat[circularMap[leftIdx]] += inc;
        heat[circularMap[rightIdx]] += inc;
    }
}

function printProbabilityChart() {
    const total = Object.values(heat).reduce((a, b) => a + b, 0);
    const sorted = Object.entries(heat)
        .map(([n, h]) => ({ n: Number(n), h }))
        .sort((a, b) => b.h - a.h);

    for (const { n, h } of sorted) {
        const prob = (h / total) * 100;
        const bar = "█".repeat(Math.round(prob));
        console.log(`${n.toString().padStart(2, " ")} | ${bar} ${prob.toFixed(2)}%`);
    }
}

connect(process.env.MONGO_URL!)
    .then(async () => {
        const history = await RouletteHistory.find()

        for (const item of history) {
            hitNumber(item.number)
        }

        printProbabilityChart();
    })