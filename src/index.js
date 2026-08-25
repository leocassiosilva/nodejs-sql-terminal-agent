import {createInterface} from "node:readline";
import {styleText} from "node:util";
import {generateSqlObject, generateTextAnswer} from "./ai.js";
import {createDb} from "./db.js";
import {DB_FILE} from "./constants.js";

const db = createDb(DB_FILE);
const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
});


function prompt(text){
    return new Promise(resolve => rl.question(text, resolve));
}

rl.on("close", () => {
    db.close();
    console.log(styleText("gray", "Sessão encerrada. Até logo!"));
    process.exit(0);
});

console.log("Bem-vindo ao assistente de SQL! Digite 'sair' para encerrar.");

while (true) {
    const question = await prompt(styleText(["bold", "magenta"], "Pergunta: "));
    if (!question.trim()){
        continue;
    }
    if (question.trim().toLowerCase() === "sair"){
        rl.close();
        break;
    }

    try {
        const sqlObject = await generateSqlObject(question);
        const {sql, explanation} = sqlObject;

        console.log(styleText("cyan", "\nSQL gerado:"));
        console.log(styleText("yellow", sql));
        console.log(styleText("cyan", "\nExplicação:"));
        console.log(styleText("yellow", explanation));

        const confirm = await prompt(styleText(["bold", "green"], "\nDeseja executar este SQL no banco de dados? (s/n): "));
        if (confirm.trim().toLowerCase() === "s") {
            const rows = db.prepare(sql).all();
            const answer = await generateTextAnswer({question, sql, rows});
            console.log(styleText("cyan", "\nResposta:"));
            console.log(styleText("green", answer));
        } else {
            console.log(styleText("yellow", "Execução do SQL cancelada."));
        }

    }  catch (error) {
        console.error(styleText("red", `Erro ao gerar SQL: ${error.message}`));
    }
}
