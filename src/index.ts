import "dotenv/config";
import { createApp } from "./main.js";

const app = await createApp();
const port = process.env.PORT ? Number(process.env.PORT) : 8080;
const host = process.env.HOST ?? "0.0.0.0";

app.listen({ port, host }, () => {
  console.log(`🚀🚀🚀 Graph is running on: http://${host}:${port}/graphql`);
});
