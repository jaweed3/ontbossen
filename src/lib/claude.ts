const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY || "";
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

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
  if (!CLAUDE_API_KEY) {
    return generateFallbackQuestions(topic);
  }

  const prompt = `Kamu adalah guru Indonesia yang membuat soal diagnostik. 
Buat 5 soal pilihan ganda untuk topik "${topic}" (${description}).

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
    const response = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    const json = JSON.parse(content.replace(/```json|```/g, "").trim());
    return json as GeneratedQuestion[];
  } catch (err) {
    console.error("Claude API failed, using fallback questions:", err);
    return generateFallbackQuestions(topic);
  }
}

function generateFallbackQuestions(topic: string): GeneratedQuestion[] {
  return [
    {
      question_text: `Apa yang dimaksud dengan "${topic}"?`,
      options: [
        "A. Konsep dasar yang perlu dipahami",
        "B. Jawaban yang salah tapi umum",
        "C. Istilah yang tidak relevan",
        "D. Semua jawaban benar",
      ],
      correct_answer: "A. Konsep dasar yang perlu dipahami",
      concept_tag: `${topic.toLowerCase().replace(/\s+/g, "-")}-dasar`,
    },
    {
      question_text: `Manakah pernyataan yang benar tentang ${topic}?`,
      options: [
        "A. Konsep ini berdiri sendiri",
        "B. Terkait dengan konsep sebelumnya",
        "C. Tidak perlu dipelajari",
        "D. Hanya untuk tingkat lanjut",
      ],
      correct_answer: "B. Terkait dengan konsep sebelumnya",
      concept_tag: `${topic.toLowerCase().replace(/\s+/g, "-")}-relasi`,
    },
    {
      question_text: `Contoh penerapan ${topic} dalam kehidupan sehari-hari adalah...`,
      options: [
        "A. Tidak ada penerapan nyata",
        "B. Hanya di buku pelajaran",
        "C. Sering ditemui dalam aktivitas sehari-hari",
        "D. Hanya di laboratorium",
      ],
      correct_answer: "C. Sering ditemui dalam aktivitas sehari-hari",
      concept_tag: `${topic.toLowerCase().replace(/\s+/g, "-")}-aplikasi`,
    },
    {
      question_text: `Kesalahan umum siswa saat mempelajari ${topic} adalah...`,
      options: [
        "A. Tidak ada kesalahan umum",
        "B. Salah memahami konsep dasar",
        "C. Terlalu mudah sehingga tidak perlu latihan",
        "D. Hanya kesalahan hitung",
      ],
      correct_answer: "B. Salah memahami konsep dasar",
      concept_tag: `${topic.toLowerCase().replace(/\s+/g, "-")}-miskonsepsi`,
    },
    {
      question_text: `Setelah memahami ${topic}, siswa seharusnya mampu...`,
      options: [
        "A. Menjelaskan kembali dengan bahasa sendiri",
        "B. Hanya mengerjakan soal",
        "C. Tidak perlu bisa menjelaskan",
        "D. Cukup mendengarkan penjelasan guru",
      ],
      correct_answer: "A. Menjelaskan kembali dengan bahasa sendiri",
      concept_tag: `${topic.toLowerCase().replace(/\s+/g, "-")}-evaluasi`,
    },
  ];
}
