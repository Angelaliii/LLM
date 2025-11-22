import express from "express";
import cors from "cors";
import ollamaRouter from "./routes/ollama";
import evalRouter from "./routes/eval";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/ollama", ollamaRouter);
app.use("/api/eval", evalRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});

export default app;