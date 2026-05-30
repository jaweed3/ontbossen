// ⚠️ WARNING: VITE_ prefix variables are exposed client-side.
// Only use VITE_CLAUDE_API_KEY for local dev. In production, set
// OPENROUTER_API_KEY in Vercel (no VITE_ prefix) — handled by api/generate.ts.
const CLAUDE_KEY = import.meta.env.VITE_CLAUDE_API_KEY || "";

export interface GeneratedQuestion {
  question_text: string;
  options: string[];
  correct_answer: string;
  concept_tag: string;
}

export async function generateQuestions(
  topic: string,
  description: string
): Promise<GeneratedQuestion[]> {
  const origin = window.location.origin;

  try {
    const res = await fetch(`${origin}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, description }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.questions as GeneratedQuestion[];
    }
  } catch (err) {
    console.warn("Serverless API unavailable, trying alternatives:", err);
  }

  if (CLAUDE_KEY) {
    try {
      return await viaClaudeDirect(topic, description);
    } catch (err) {
      console.error("Claude direct failed:", err);
    }
  }

  return generateFallbackQuestions(topic);
}

const PROMPT = (topic: string, desc: string) =>
  `Kamu adalah guru Indonesia yang membuat soal diagnostik.
Buat 5 soal pilihan ganda untuk topik "${topic}" (${desc}).

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

function extractJSON(raw: string): GeneratedQuestion[] {
  return JSON.parse(raw.replace(/```json|```/g, "").trim()) as GeneratedQuestion[];
}

async function viaClaudeDirect(topic: string, desc: string) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": CLAUDE_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: PROMPT(topic, desc) }],
    }),
  });
  if (!res.ok) throw new Error(`Claude direct ${res.status}`);
  const data = await res.json();
  return extractJSON(data.content[0].text);
}

function generateFallbackQuestions(topic: string): GeneratedQuestion[] {
  return [
    {
      question_text: `Apa yang dimaksud dengan "${topic}"?`,
      options: ["A. Konsep dasar yang perlu dipahami", "B. Jawaban yang salah tapi umum", "C. Istilah yang tidak relevan", "D. Semua jawaban benar"],
      correct_answer: "A. Konsep dasar yang perlu dipahami",
      concept_tag: `${topic.toLowerCase().replace(/\s+/g, "-")}-dasar`,
    },
    {
      question_text: `Manakah pernyataan yang benar tentang ${topic}?`,
      options: ["A. Konsep ini berdiri sendiri", "B. Terkait dengan konsep sebelumnya", "C. Tidak perlu dipelajari", "D. Hanya untuk tingkat lanjut"],
      correct_answer: "B. Terkait dengan konsep sebelumnya",
      concept_tag: `${topic.toLowerCase().replace(/\s+/g, "-")}-relasi`,
    },
    {
      question_text: `Contoh penerapan ${topic} dalam kehidupan sehari-hari adalah...`,
      options: ["A. Tidak ada penerapan nyata", "B. Hanya di buku pelajaran", "C. Sering ditemui dalam aktivitas sehari-hari", "D. Hanya di laboratorium"],
      correct_answer: "C. Sering ditemui dalam aktivitas sehari-hari",
      concept_tag: `${topic.toLowerCase().replace(/\s+/g, "-")}-aplikasi`,
    },
    {
      question_text: `Kesalahan umum siswa saat mempelajari ${topic} adalah...`,
      options: ["A. Tidak ada kesalahan umum", "B. Salah memahami konsep dasar", "C. Terlalu mudah sehingga tidak perlu latihan", "D. Hanya kesalahan hitung"],
      correct_answer: "B. Salah memahami konsep dasar",
      concept_tag: `${topic.toLowerCase().replace(/\s+/g, "-")}-miskonsepsi`,
    },
    {
      question_text: `Setelah memahami ${topic}, siswa seharusnya mampu...`,
      options: ["A. Menjelaskan kembali dengan bahasa sendiri", "B. Hanya mengerjakan soal", "C. Tidak perlu bisa menjelaskan", "D. Cukup mendengarkan penjelasan guru"],
      correct_answer: "A. Menjelaskan kembali dengan bahasa sendiri",
      concept_tag: `${topic.toLowerCase().replace(/\s+/g, "-")}-evaluasi`,
    },
  ];
}
