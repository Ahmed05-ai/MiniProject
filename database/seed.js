/**
 * Smart Campus Student Management System
 * Deterministic Seeding Entrypoint
 */

const { seed, exportSnapshots } = require('./seed/seed');

if (require.main === module) {
    seed(true)
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Seeding error:', err);
            process.exit(1);
        });
}

module.exports = { seed, exportSnapshots };
