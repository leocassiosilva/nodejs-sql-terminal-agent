import { DatabaseSync } from 'node:sqlite';

export function createDb(path = ':memory:') {
    const db = new DatabaseSync(path);

    db.exec(
        `CREATE TABLE IF NOT EXISTS logs (
            log_id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip TEXT NOT NULL,
            username TEXT NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT NOT NULL,
            location TEXT NOT NULL,
            job_area TEXT NOT NULL,
            company TEXT NOT NULL,
            job_title TEXT NOT NULL,
            id TEXT NOT NULL,
            timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`
    );

    return db;
}
