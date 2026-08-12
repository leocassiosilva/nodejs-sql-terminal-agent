import {createInterface} from 'node:readline';
import  {createReadStream} from 'node:fs';
import {LOG_FILE, LOG_INTERVAL, DB_FILE} from './constants.js';
import {createDb} from './db.js';

const fileStream = createReadStream(LOG_FILE);
const db = createDb(DB_FILE);

const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
});

console.log(`Iniciando ingestão de registros do arquivo ${LOG_FILE} para o banco de dados...`);

let count = 0;  

for await (const line of rl) {
    if (!line.trim()) continue; // Ignora linhas em branco

    let record;
    try {
        record = JSON.parse(line);
    } catch (error) {
        console.error(`Erro ao analisar a linha: ${line}`);
        continue; // Pula para a próxima linha
    }

    db.prepare(
        `
        INSERT INTO logs (
            ip,
            username,
            first_name,
            last_name,
            email,
            location,
            job_area,
            company,
            job_title,
            id,
            timestamp
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )`
    ).run(
        record.ip,
        record.username,
        record.first_name,
        record.last_name,
        record.email,
        record.location,
        record.job_area,
        record.company,
        record.job_title,
        record.id,
        record.timestamp
    )
    count++;

    if (count % LOG_INTERVAL === 0) {
        console.log(`Registros processados: ${count}`);
    }
}

console.log(`Ingestão concluída. Total de registros processados: ${count}`);
db.close();