[![Version](https://img.shields.io/badge/version-1.1-blue.svg)](https://github.com/proelias7/backup-gerator/releases)


# Backup Generator

Este é um aplicativo Node.js para a geração e gerenciamento automatizado de backups de bancos de dados. Ele cria backups e mantém a retenção dos dados conforme configurado no arquivo `config.json`.

## Funcionalidades

- Geração automática de backups de bancos de dados MySQL.
- Retenção de backups local por um período configurável.
- Redundância de dados por servidor externo.

## Pré-requisitos

- [`Node.js`](https://nodejs.org/en/download/prebuilt-installer) instalado na máquina.

## Instalação

1. Clone o repositório:

    ```sh
    git clone https://github.com/proelias7/backup-gerator.git
    cd backup-gerator
    ```

2. Crie e configure o arquivo `config.json` com suas informações de conexão e configurações:

    ```json
    {
        "webhook":"http://localhost/backup-server/",
        "retention": 30,
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

    - `webhook`: webhook para enviar os backups para o servidor de replicação.
    - `retention`: O número de dias para manter os backups antes de excluí-los. `0` manterá somente o backup mais recente.
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

3. Instalando Servidor de Replicação `opicional`:
    ## Pré-requisitos
    - Servidor [`Apache`](https://httpd.apache.org/download.cgi#apache24) ou [`xamp`](https://www.apachefriends.org/pt_br/index.html) instalado na maquina de replicação
    - copiar a pasta `backup-server` para:
        - apache: `www/html`
        - xamp: `xamp/htdocs`
## Uso

### Iniciando a Aplicação

- `windows`: Execute o `start.bat`
- `linux`: Navegue até a pasta do repositório execute `npm start`, Caso não tenha instalado as dependências ainda execute `npm i`