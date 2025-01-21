import createApp from "@src/app";

const app = createApp();

async function main() {
  const PORT = 8080;
  app.listen(`${PORT}`, () => {
    console.log(`
      🛡️  Server listening on port: ${PORT} 🛡️
    `);
  });
}

main();
