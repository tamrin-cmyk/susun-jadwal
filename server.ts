import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client to prevent startup crashes if key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required to run AI scheduling analysis.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Routes
app.post("/api/gemini-analysis", async (req, res) => {
  try {
    const { config, teachers, subjects, classes, assignments, slots, conflicts } = req.body;

    const ai = getGeminiClient();

    const systemInstruction = 
      "Anda adalah seorang konsultan kurikulum dan pakar manajemen sekolah khusus SMK di Indonesia. " +
      "Tugas Anda adalah meninjau draf jadwal pelajaran, memberikan masukan pedagogis yang membangun, " +
      "menganalisis beban guru (termasuk guru kejuruan DKV), memberikan solusi penanganan konflik draf jadwal, " +
      "dan memberikan tips optimalisasi agar guru tidak terlalu lelah dan siswa tetap konsentrasi.";

    const prompt = `
Berikut adalah data draf jadwal pelajaran untuk sekolah:
Nama Sekolah: ${config?.jenjang || "SMKS"} ${config?.namaInstansi || "Cordova"}
Lokasi: ${config?.kota || "Tebo"}
Tahun Ajaran: ${config?.tahunAjaran || "2026/2027"} (${config?.semester || "Ganjil"})

Daftar Kelas:
${JSON.stringify(classes?.map((c: any) => c.name), null, 2)}

Daftar Guru:
${JSON.stringify(teachers?.map((t: any) => ({ Kode: t.code, Nama: t.name })), null, 2)}

Daftar Mata Pelajaran DKV & Umum:
${JSON.stringify(subjects?.map((s: any) => ({ Kode: s.code, Nama: s.name, Kelompok: s.kelompok, JP: s.totalJP })), null, 2)}

Jumlah Konflik/Bentrok Saat Ini: ${conflicts?.length || 0}
Daftar Konflik Detail:
${JSON.stringify(conflicts?.map((cf: any) => cf.description), null, 2)}

Berikan analisis komprehensif berformat Markdown yang mencakup:
1. **Evaluasi Umum**: Apakah draf jadwal ini sudah layak jalan dan sesuai porsi kurikulum SMK?
2. **Analisis Guru Kejuruan (DKV)**: Berikan perhatian khusus pada guru-guru DKV (terutama Guru Tamrin, S.Pd) terkait pembagian jam mengajarnya.
3. **Saran Distribusi Jam**: Apakah jam pelajaran berat (seperti praktik DKV yang memakan 4-6 JP berturut-turut) sebaiknya diletakkan di pagi hari?
4. **Rekomendasi Konflik**: Berikan panduan cara menyelesaikan bentrok yang terjadi (jika ada).
5. **Kesimpulan & Motivasi**: Catatan penutup yang ramah dan suportif untuk sekolah SMKS Cordova Tebo.

Tulis tanggapan dalam Bahasa Indonesia yang formal, sopan, menginspirasi, dan sangat informatif.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({
      success: true,
      analysis: response.text || "Gagal menghasilkan analisis."
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Terjadi kesalahan internal pada server AI."
    });
  }
});

// Setup dev/production environments
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode - Use Vite in Middleware Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode - Serve static files from dist directory
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Full-Stack App running on http://localhost:${PORT}`);
  });
}

startServer();
