# Bets Bot

Este projeto é um bot para automação de apostas em cassinos online.

> **Nota:** O campo `WS_URL` deve ser atualizado pelo menos uma vez ao dia, pois a roleta desconecta automaticamente e a sessão expira.

## Como rodar

1. **Configure as variáveis de ambiente:**
    - No arquivo `index.ts`, altere manualmente os valores de:
      - `WS_URL`: Cole o link do websocket do site do cassino.
      - `MONGO_URL`: Insira a URL de conexão do seu banco MongoDB.

2. **Configuração da aposta:**
    - O valor da aposta é dobrado a cada derrota (estratégia de martingale).
    - Para uma meta de $40 por dia, recomenda-se um saldo mínimo de 102, pois existe a possibilidade (rara, mas possível) de ocorrer uma sequência de 10 vezes a mesma cor. Isso garante que você tenha saldo suficiente para cobrir essa sequência.

3. **Crie um usuário:**
    - O usuário é criado no model `state.ts`. No arquivo, há uma configuração onde você deve inserir os dados do usuário.
    - Para obter esses dados:
        1. Abra uma mesa no cassino, como esta: [https://rollbit.com/game/pragmaticexternal:RouletteAzure](https://rollbit.com/game/pragmaticexternal:RouletteAzure).
        2. Abra a aba de "Socket" no inspetor de elementos do navegador.
        3. Aguarde até que algum link chamado `game?` seja chamado e observe as mensagens.
        4. Copie o link do `game?` que aparecer e coloque no arquivo `.env` no campo `WS_URL`.
        5. Com os logs em mãos, clique para apostar 0.1 na tela e cancele a aposta.
        6. No log, procure pela mensagem `command` enviada ao simular a aposta. O `user id` estará no campo `UID` do XML do comando.

4. **Execute o bot:**
    ```bash
    bun index.ts
    ```

Pronto! O bot estará rodando.