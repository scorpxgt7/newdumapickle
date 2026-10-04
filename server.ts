import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // API route for AI Quiz
  app.post("/api/ai-quiz", async (req, res) => {
    try {
      const { answers } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is required" });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `You are an expert Pickleball coach. Based on the following answers from a player, determine their estimated DUPR or local skill rating level (e.g., 2.0, 3.5, 4.0, etc.) and provide a short, encouraging summary of their playstyle. 
      Keep the response brief, around 2-3 sentences.
      
      Player Answers:
      ${answers.map((a: any, i: number) => `Q${i + 1}: ${a}`).join("\n")}
      
      Format your response like:
      Rating: [Rating Level]
      Summary: [Your summary here]`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Failed to generate rating" });
    }
  });

  // API route to fetch venues and court locations from Cloud SQL database
  app.get("/api/venues", async (req, res) => {
    try {
      if (!process.env.SQL_HOST) {
        return res.json({ success: true, venues: [] });
      }
      const { db } = await import("./src/db/index.ts");
      const { venues } = await import("./src/db/schema.ts");
      const result = await db.select().from(venues);
      res.json({ success: true, venues: result });
    } catch (error: any) {
      console.error("Error querying Cloud SQL venues:", error);
      res.json({ success: false, venues: [], message: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
