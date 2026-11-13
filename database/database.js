/**
 * Smart Campus Student Management System
 * Authoritative Centralized Database Layer
 * 
 * Uses SQLite (persistent file-based relational database) with foreign key support,
 * WAL mode for high-concurrency read/write, parameterized queries, and full 28-table schema.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'smart_campus.sqlite');

let dbInstance = null;

function getDatabase() {
    if (!dbInstance) {
        dbInstance = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('❌ Failed to connect to SQLite database:', err.message);
            } else {
                console.log('✅ Connected to SQLite database at:', DB_PATH);
            }
        });

        // Enable foreign keys and WAL mode for reliability and performance
        dbInstance.run('PRAGMA foreign_keys = ON;');
        dbInstance.run('PRAGMA journal_mode = WAL;');
    }
    return dbInstance;
}

/**
 * Execute a query with parameters (INSERT, UPDATE, DELETE, CREATE)
 * Returns { lastID, changes }
 */
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        db.run(sql, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
}

/**
 * Retrieve a single row
 */
function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row || null);
            }
        });
    });
}

/**
 * Retrieve all matching rows
 */
function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows || []);
            }
        });
    });
}

/**
 * Execute multiple statements in sequence within a transaction
 */
async function transaction(queries) {
    const db = getDatabase();
    await run('BEGIN TRANSACTION');
    try {
        const results = [];
        for (const q of queries) {
            const res = await run(q.sql, q.params || []);
            results.push(res);
        }
        await run('COMMIT');
        return results;
    } catch (err) {
        await run('ROLLBACK');
        throw err;
    }
}

/**
 * Execute raw multi-statement SQL script (for schemas and migrations)
 */
function execScript(sql) {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        db.exec(sql, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

/**
 * Initialize all database tables matching connected models (28 tables across 20 modules)
 */
async function initializeSchema() {
    console.log('🔄 Initializing authoritative 28-table database schema...');
    
    const schemaFile = path.join(__dirname, 'schema', 'schema.sql');
    if (fs.existsSync(schemaFile)) {
        const ddl = fs.readFileSync(schemaFile, 'utf8');
        await execScript(ddl);
    } else {
        throw new Error('Schema file not found at ' + schemaFile);
    }

    console.log('✅ Database schema initialized successfully (28 tables, full constraints & indexes).');
}

module.exports = {
    getDatabase,
    run,
    get,
    all,
    transaction,
    execScript,
    initializeSchema,
    DB_PATH
};
