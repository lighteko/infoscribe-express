import createApp from "@src/app";

const app = createApp();

async function main() {
  const PORT = 8000;
  app.listen(`${PORT}`, () => {
    console.log(`\n* Server running on http://127.0.0.1:${PORT}\n`);
  });
}

main();
