import {createWriteStream, statSync} from 'node:fs';
import {faker} from '@faker-js/faker';

const LOG_FILE = 'acess.log';

const LOG_INTERVAL = 1 * 1000;

const maxRecords = Number(process.argv[2] || Infinity);

if((!Number.isInteger(maxRecords) && Number.isFinite(maxRecords))
||  Number.isNaN(maxRecords)
||  maxRecords < 0) {
  console.error('Uso: npm run seed -- <quantidade>');
  console.error('A quantidade deve ser um número inteiro positivo ou zero.');
  process.exit(1);
}

const stream = createWriteStream(LOG_FILE);


function generateuser(){
    return {
        ip: faker.internet.ip(),
        username: faker.internet.userName(),
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        email: faker.internet.email(),
        location: faker.address.city(),
        job_area: faker.name.jobArea(),
        company: faker.company.name(),
        job_title: faker.name.jobTitle(),
        id: faker.string.uuid(),
    }
}

function generateLogEntry(user) {
    return{
        ...user,
        timestamp: faker.date.recent().toISOString(),
    }
}

function writerRecord(line){
    return new Promise((resolve) => {
        if (!stream.write(line)){
            stream.once('drain', resolve);
        } else {
            resolve();
        }
    })
}

function convertToGB(bytes) {
    return (bytes / 1024 / 1024 / 1024).toFixed(4);
}

console.log(`Gerando ${maxRecords} registros de log no arquivo ${LOG_FILE}...`);
console.log(`Limite de registro: ${maxRecords}`);

const users  = Array.from({length: 5}, generateuser);


process.on('SIGINT', () => {
    stream.end(() => {
        const { size } = statSync(LOG_FILE);
        console.log(`Registros gerados: ${count}, tamanho final do arquivo: ${convertToGB(size)} GB`);
        console.log('Geração de registros interrompida pelo usuário.');
        process.exit(0);
    })
});


let count = 0;

while (count < maxRecords) {
    const user = faker.helpers.arrayElement(users);
    const record = generateLogEntry(user);

    await writerRecord(JSON.stringify(record) + '\n');
    count++;

    if (count % LOG_INTERVAL === 0) {
        const { size } = statSync(LOG_FILE);
        console.log(`Registros gerados: ${count}, tamanho do arquivo: ${convertToGB(size)} GB`);
    }

}


stream.end(() => {
    const { size } = statSync(LOG_FILE);
    console.log(`Registros gerados: ${count}, tamanho final do arquivo: ${convertToGB(size)} GB`);
    console.log('Geração de registros concluída.');
});
