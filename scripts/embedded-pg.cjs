const EmbeddedPostgres = require('embedded-postgres').default;
const path = require('path');
const fs = require('fs');

const port = parseInt(process.env.PGPORT || '5433', 10);
const dbPath = path.join(__dirname, '..', '.postgres-data');

if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

const pg = new EmbeddedPostgres({
  port,
  user: 'postgres',
  password: 'password',
  database: 'findworker',
  persistent: true,
  dataDir: dbPath
});

async function main() {
  console.log(`[PostgreSQL] Initializing on port ${port}...`);
  try {
    await pg.initialise();
  } catch (err) {
    // If already initialized, proceed to start
  }

  await pg.start();
  console.log(`[PostgreSQL] Database 'findworker' is ready on 127.0.0.1:${port}`);

  const handleShutdown = async () => {
    console.log('[PostgreSQL] Shutting down database...');
    try {
      await pg.stop();
    } catch (e) {}
    process.exit(0);
  };

  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);
}

main().catch(err => {
  console.error('[PostgreSQL] Error starting database:', err);
  process.exit(1);
});

