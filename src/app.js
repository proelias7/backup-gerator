import fs from 'fs'
import cron from'node-cron'
import dir from 'path'
import mysqldump from 'mysqldump';
import axios from 'axios';
import FormData from 'form-data';
import archiver from 'archiver';

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

async function performBackup() {
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
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - config.retention);

            const date = new Date();
            const datetime = `${date.getDate()}-${(date.getMonth() + 1)}-${date.getFullYear()}-${date.getHours()}-${date.getMinutes()}`;
            const local = `./${pathDB}/${datetime}.sql`;

            await mysqldump({
                connection: {
                    host: v.host,
                    user: v.user,
                    password: v.password,
                    port: v.port,
                    database: table
                },
                dumpToFile: local
            }).then(async () => {
                const statements = `CREATE DATABASE IF NOT EXISTS \`${table}\` /*!40100 DEFAULT CHARACTER SET latin1 */;\n` +
                            `USE \`${table}\`;\n\n`;

                fs.writeFileSync(local, statements + fs.readFileSync(local, 'utf-8'));

                console.log(`Backup local realizado Base: ${table} Data: ${datetime}`);

                if (config.webhook.length > 0) {
                    const zip = archiver('zip', {
                        zlib: { level: 9 }
                    });

                    const outputZipPath = dir.join(pathDB, `${datetime}.zip`);
            
                    const output = fs.createWriteStream(outputZipPath);
                    
                    zip.on('error', (err) => {
                        console.log(`Erro ao compactar arquivos:\n${err.message}`);
                    });

                    output.on('close', async () => {
                        const formData = new FormData();
                    
                        formData.append('payload_json', JSON.stringify({
                            content: `Backup realizado com sucesso!`
                        }));
                    
                        formData.append('file', fs.createReadStream(outputZipPath));
                    
                        try {
                            await axios.post(config.webhook, formData, { 
                                headers: formData.getHeaders(),
                                maxContentLength: Infinity,
                                maxBodyLength: Infinity, 
                                timeout: 300000             
                            });
                            
                            console.log(`Backup salvo na nuvem!`);
                
                            fs.unlink(outputZipPath, (err) => {
                                if (err) console.log(`Erro ao deletar arquivo zip: ${err.message}`);
                            });

                            if (config.retention > 0) {
                                const thirtyDaysAgo = new Date();
                                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - config.retention);
                
                                fs.readdirSync(pathDB).forEach((file) => {
                                    const filePath = dir.join(pathDB, file);
                                    const [day, month, year, hour, minute] = file.split('.sql')[0].split('-');
                                    const fileDate = new Date(year, month - 1, day, hour, minute);
                                    if (fileDate < thirtyDaysAgo) {
                                        fs.unlinkSync(filePath);
                                    }
                                });
                            }else{
                                const files = fs.readdirSync(pathDB).filter(file => file.endsWith('.sql'));
                                if (files.length > 1) {
                                    files.sort((a, b) => {
                                        const [dayA, monthA, yearA, hourA, minuteA] = a.split('.sql')[0].split('-');
                                        const [dayB, monthB, yearB, hourB, minuteB] = b.split('.sql')[0].split('-');
                                        return new Date(yearB, monthB - 1, dayB, hourB, minuteB) - new Date(yearA, monthA - 1, dayA, hourA, minuteA);
                                    });
                                
                                    files.slice(1).forEach(file => {
                                        const filePath = dir.join(pathDB, file);
                                        fs.unlinkSync(filePath);
                                    });
                                }
                            }
                        } catch (error) {
                            console.log(`Erro ao enviar backup para a nuvem: ${error.message}`);
                        }
                    });

                    zip.append(fs.createReadStream(local), { name: `${datetime}.sql` });
            
                    zip.pipe(output);
                    
                    zip.finalize();
                }
            }).catch((error) => {
                console.log(`Erro ao relizar o backUp Base: ${table}\n${error}`);
            }); 
        }); 
    });
}

try {
    if (process.env.NODE_ENV === 'production') {
        cron.schedule(config.cron, performBackup);
        console.log('Aplicação iniciada em produção. Backup agendado.');
    } else {
        console.log('Aplicação iniciada em desenvolvimento. Executando backup imediatamente.');
        await performBackup();
    }
} catch (error) {
    console.error('Erro ao iniciar a aplicação:', error);
}
