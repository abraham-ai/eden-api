import createServer from './server';
import * as Sentry from '@sentry/node';

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.2,
});

const server = await createServer();
const port = +server.config.API_PORT;
const host = server.config.API_HOST;
await server.listen({ host, port });

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () =>
    server.close().then((err) => {
      console.log(`close application on ${signal}`);
      process.exit(err ? 1 : 0);
    }),
  );
}
