import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { topic, description } = req.body;

  if (!topic || typeof topic !== "string") {
    return res.status(400).json({ error: "topic is required" });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  const prompt = `Kamu adalah guru Indonesia yang membuat soal diagnostik.
Buat 5 soal pilihan ganda untuk topik "${topic}" (${description || ""}).

Setiap soal harus:
1. Mengukur pemahaman konsep spesifik
2. Punya 4 pilihan jawaban (A, B, C, D)
3. Satu jawaban benar
4. Punya concept_tag yang spesifik (misal: "pecahan-campuran", "pembagian-desimal")

Format output JSON array (jangan tambahkan markdown atau teks lain):
[
  {
    "question_text": "...",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "correct_answer": "A. ...",
    "concept_tag": "konsep-spesifik"
  }
]

Buat soal yang bisa mengidentifikasi MISKONSEPSI siswa, bukan hanya benar/salah.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenRouter error:", response.status, text);
      return res.status(502).json({ error: "AI service error" });
    }

    const data = await response.json();
    const raw = data.choices[0].message.content;
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const questions = JSON.parse(cleaned);

    return res.status(200).json({ questions });
  } catch (err) {
    console.error("Generate error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
