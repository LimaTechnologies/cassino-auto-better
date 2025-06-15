# Bets Bot

Este projeto é um bot para automação de apostas em cassinos online.

## Como rodar

1. **Configure as variáveis de ambiente:**
    - No arquivo `index.ts`, altere manualmente os valores de:
      - `WS_URL`: Cole o link do websocket do site do cassino.
      - `MONGO_URL`: Insira a URL de conexão do seu banco MongoDB.

2. **Crie um usuário:**
    - No model de usuário, edite manualmente os valores necessários para criar um novo usuário.

3. **Execute o bot:**
    ```bash
    bun index.ts
    ```

Pronto! O bot estará rodando.