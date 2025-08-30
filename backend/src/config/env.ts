import path from "path";
import dotenv from "dotenv";

export function loadEnv() {
  const candidates = [
    path.resolve(process.cwd(), ".env"),             // current working dir
    path.resolve(__dirname, "../.env"),              // when running ts-node from src
    path.resolve(__dirname, "../../.env"),           // when running dist/index.js
  ];

  for (const p of candidates) {
    const res = dotenv.config({ path: p });
    if (!res.error) {
      console.log(`[env] loaded: ${p}`);
      return;
    }
  }

  console.warn("[env] .env not found via known paths; using process.env only");
}
