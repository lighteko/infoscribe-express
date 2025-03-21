import createApp from "@src/app";

const app = createApp();

async function main() {
  const EXPRESS_PORT = process.env.EXPRESS_PORT as any as number;

  app.listen(EXPRESS_PORT, '0.0.0.0', () => {
    console.log(`\n* Server running on http://127.0.0.1:${EXPRESS_PORT}\n`);
  });
}

main();
