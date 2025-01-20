import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";


const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("API Running");
});

async function run() {
  try {
    
    app.listen("8080", () => {
      console.log(`
      
      🛡️  Server listening on port: 8080 🛡️
      
    `);
    });
  } finally {
    
  }
}
run().catch(console.dir);