import { connect } from "mongoose"
import { RouletteHistory } from "../model/history";

await connect(process.env.MONGO_URL!)

const history = await RouletteHistory.find({})

type Cor = "red" | "black" | "green";


let saldo = 102;
let apostaBase = 0.1;
let apostaAtual = apostaBase;
let ultimaCor: Cor | null = null;
let apostando = false;
let corAposta: Cor | null = null;
let wins = 0;
let losses = 0;
let emSequencia = 0; // Quantas vezes perdeu na sequência
let cicloAtivo = false;
let apostaCiclo = apostaBase;

let aguardandoMudanca = true;
for (const [i, item] of history.entries()) {
    const corAtual = item.color as Cor;

    if (aguardandoMudanca) {
        // Só começa a apostar quando a cor mudar
        if (ultimaCor && corAtual !== ultimaCor) {
            corAposta = ultimaCor === "red" ? "black" : "red";
            cicloAtivo = true;
            apostaCiclo = apostaBase;
            emSequencia = 0;
            aguardandoMudanca = false;
        } else {
            ultimaCor = corAtual;
            continue;
        }
    }

    if (cicloAtivo) {
        if (corAtual === corAposta) {
            // Ganhou a aposta (encerra ciclo martingale)
            saldo += apostaCiclo;
            wins++;
            console.log(`[${i}] WIN | Cor: ${corAtual} | Apostou: ${apostaCiclo.toFixed(2)} | Saldo: ${saldo.toFixed(2)} | Tentativas: ${emSequencia + 1}`);
            // Reinicia ciclo, volta a aguardar nova mudança
            cicloAtivo = false;
            apostaCiclo = apostaBase;
            emSequencia = 0;
            aguardandoMudanca = true;
        } else {
            // Perdeu a aposta, dobra para próxima
            saldo -= apostaCiclo;
            emSequencia++;
            console.log(`[${i}] LOSS | Cor: ${corAtual} | Apostou: ${apostaCiclo.toFixed(2)} | Saldo: ${saldo.toFixed(2)} | Tentativas: ${emSequencia}`);
            apostaCiclo *= 2;
            // Se não consegue mais dobrar, considera como loss do ciclo
            if (saldo < apostaCiclo) {
                losses++;
                console.log("Saldo insuficiente para dobrar. Encerrando ciclo de aposta.");
                cicloAtivo = false;
                apostaCiclo = apostaBase;
                emSequencia = 0;
                aguardandoMudanca = true;
                continue;
            }
        }
    }
    ultimaCor = corAtual;
}

console.log(`Saldo final: ${saldo.toFixed(2)}`);
console.log(`Wins: ${wins}, Losses: ${losses}`);