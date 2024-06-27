# Backup Generator

Este é um aplicativo Node.js para a geração e gerenciamento automatizado de backups de bancos de dados. Ele cria backups e mantém a retenção dos dados conforme configurado no arquivo `config.json`.

## Funcionalidades

- Geração automática de backups de bancos de dados MySQL.
- Retenção de backups por um período configurável.
- Endpoint para listar backups disponíveis.
- Autenticação por chave API para acesso seguro ao endpoint.

## Pré-requisitos

- Node.js instalado na máquina.

## Instalação

1. Clone o repositório:

    ```sh
    git clone https://github.com/proelias7/backup-gerator.git
    cd backup-gerator
    ```

2. Crie e configure o arquivo `config.json` com suas informações de conexão e configurações:

    ```json
    {
        "port": 3000,
        "apiKey": "sua-api-key",
        "dataRetention": 30,
        "cron": "0 0 12 * * *",
        "connections": {
            "mysql": {
                "database1": {
                    "host": "localhost",
                    "user": "root",
                    "password": "sua-senha",
                    "databases": {
                        "nome_database": "tabela"
                    }
                }
            }
        }
    }
    ```
    ### Explicação dos campos do `config.json`:

    - `port`: A porta na qual o servidor irá escutar. Por exemplo, `3000`.
    - `apiKey`: Uma chave API para autenticação de requisições ao endpoint de backups. Substitua 
    - `sua-api-key` por uma chave segura.
    - `dataRetention`: O número de dias para manter os backups antes de excluí-los. Por exemplo, `30` dias.
    - `cron`: Expressão cron para agendar os backups, exemplo `0 0 12 * * *`.
        ```md
        ┌────────────── segundo (0 - 59)
        │ ┌──────────── minuto (0 - 59)
        │ │ ┌────────── hora (0 - 23)
        │ │ │ ┌──────── dia do mês (1 - 31)
        │ │ │ │ ┌────── mês (1 - 12)
        │ │ │ │ │ ┌──── dia da semana (0 - 6) (Domingo=0 ou 7)
        │ │ │ │ │ │
        * * * * * *
        ```

    - `database1`: Um identificador para a conexão com um banco de dados específico.
        - `host`: O endereço do host do banco de dados MySQL.
        - `user`: O nome de usuário para conectar ao banco de dados.
        - `password`: A senha para conectar ao banco de dados.
        - `databases`: Um objeto contendo os bancos de dados específicos e suas respectivas tabelas que serão alvo dos backups.
            - `nome_database`: O nome do banco de dados.
            - `tabela`: A tabela dentro do banco de dados que será alvo dos backups.

## Uso

### Iniciando a Aplicação

- `windows`: Execute o `start.bat`
- `linux`: Navegue até a pasta do repositório execute `npm start`, Caso não tenha instalado as dependências ainda execute `npm i`

## Acessando endpoint

```sh
curl -H "x-api-key: sua-api-key" http://localhost:3000/backups
```

- Será retornado a lista com os backups existentes ordenado por data e hora