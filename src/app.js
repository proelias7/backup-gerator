import fs from 'fs'
import cron from'node-cron'
import dir from 'path'
import mysqldump from 'mysqldump';

const config = await JSON.parse(fs.readFileSync('./config.json'));

process.on('uncaughtException',async (error,origin) => {
    const data = `Tipo: uncaughtException \nOrigen: ${origin}\nError: ${error}`
    console.log(data)
})

process.on('unhandledRejection',async (error) => {
    const data = `Tipo: unhandledRejection\nError: ${error}`
    console.log(data)
})

process.on('uncaughtExceptionMonitor', (error, origin) => {
    const data = `Tipo: uncaughtExceptionMonitor \nOrigen: ${origin}\nError: ${error}`
    console.log(data)
});

try{
    cron.schedule(config.cron, async() => {
        Object.keys(config.connections.mysql).forEach((database) => {
            const v = config.connections.mysql[database];
            Object.keys(v.databases).forEach(async (name) => {
                const table = v.databases[name];
                let pathDB = 'storage/' + name;
                
                if (!fs.existsSync(pathDB)) {
                    try {
                        await fs.promises.mkdir(pathDB, { recursive: true });
                    } catch (error) {
                        console.log('negado', error);
                        return;
                    }
                }

                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - config.dataRetention);

                fs.readdirSync(pathDB).forEach((file) => {
                    const filePath = dir.join(pathDB, file);
                    const [day, month, year, hour, minute] = file.split('.sql')[0].split('-');
                    const fileDate = new Date(year, month - 1, day, hour, minute);
                    if (fileDate < thirtyDaysAgo) {
                        fs.unlinkSync(filePath);
                    }
                });

                const date = new Date();
                const datetime = `${date.getDate()}-${(date.getMonth() + 1)}-${date.getFullYear()}-${date.getHours()}-${date.getMinutes()}`;
                const local = `./${pathDB}/${datetime}.sql`;

                await mysqldump({
                    connection: {
                        host: v.host,
                        user: v.user,
                        password: v.password,
                        database: table
                    },
                    dumpToFile: local
                }).then(() => {
                    const statements = `CREATE DATABASE IF NOT EXISTS \`${table}\` /*!40100 DEFAULT CHARACTER SET latin1 */;\n` +
                                `USE \`${table}\`;\n\n`;

                    fs.writeFileSync(local, statements + fs.readFileSync(local, 'utf-8'));

                    console.log(`Backup realizado Base: ${table} Data: ${datetime}`);
                }).catch((error) => {
                    console.log(`Erro ao relizar o backUp Base: ${table}\n${error}`);
                }); 
            }); 
        });
    });
    console.log('Aplicação iniciada');
} catch (error) {
    console.log(error);
}