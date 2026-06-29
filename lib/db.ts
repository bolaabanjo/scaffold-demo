import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), '.data', 'basecamp.db');

let db: Database.Database | null = null;

function getDb(): Database.Database {
    if (!db) {
        db = new Database(DB_PATH);
        db.pragma('journal_mode = WAL');
        db.exec(`
            CREATE TABLE IF NOT EXISTS subscriptions (
                wallet_address TEXT PRIMARY KEY,
                tx_hash TEXT NOT NULL,
                activated_at INTEGER NOT NULL,
                expires_at INTEGER NOT NULL
            )
        `);
    }
    return db;
}

export interface Subscription {
    wallet_address: string;
    tx_hash: string;
    activated_at: number;
    expires_at: number;
}

export function getSubscription(walletAddress: string): Subscription | null {
    const row = getDb()
        .prepare('SELECT * FROM subscriptions WHERE wallet_address = ? AND expires_at > ?')
        .get(walletAddress.toLowerCase(), Math.floor(Date.now() / 1000)) as Subscription | undefined;
    return row || null;
}

export function activateSubscription(walletAddress: string, txHash: string): Subscription {
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + 30 * 24 * 60 * 60;

    getDb()
        .prepare(
            `INSERT INTO subscriptions (wallet_address, tx_hash, activated_at, expires_at)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(wallet_address) DO UPDATE SET
                 tx_hash = excluded.tx_hash,
                 activated_at = excluded.activated_at,
                 expires_at = excluded.expires_at`
        )
        .run(walletAddress.toLowerCase(), txHash, now, expiresAt);

    return {
        wallet_address: walletAddress.toLowerCase(),
        tx_hash: txHash,
        activated_at: now,
        expires_at: expiresAt,
    };
}

export function getAllActiveSubscriptions(): Subscription[] {
    const rows = getDb()
        .prepare('SELECT * FROM subscriptions WHERE expires_at > ?')
        .all(Math.floor(Date.now() / 1000)) as Subscription[];
    return rows;
}
