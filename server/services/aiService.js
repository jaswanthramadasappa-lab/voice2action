require("dotenv").config();
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

let GoogleGenAI = null;
try {
  const genaiPkg = require("@google/genai");
  GoogleGenAI = genaiPkg.GoogleGenAI;
} catch (e) {
  // fallback if package not loaded
}

let Groq = null;
try {
  Groq = require("groq-sdk");
} catch (e) {
  // fallback if package not loaded
}

// ============================================
// Initialize Providers
// ============================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const USE_MOCK_AI = String(process.env.USE_MOCK_AI).toLowerCase() === "true";

let geminiClient = null;
let groqClient = null;
let openaiClient = null;

if (GEMINI_API_KEY && GoogleGenAI) {
  try {
    geminiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    console.log("🌟 Google Gemini AI Provider initialized (Gemini 2.0 Flash)");
  } catch (err) {
    console.error("⚠️ Failed to init Gemini client:", err.message);
  }
}

if (GROQ_API_KEY && Groq) {
  try {
    groqClient = new Groq({ apiKey: GROQ_API_KEY });
    console.log("⚡ Groq AI Provider initialized (Whisper + Llama 3.3)");
  } catch (err) {
    console.error("⚠️ Failed to init Groq client:", err.message);
  }
}

if (OPENAI_API_KEY) {
  try {
    openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
    console.log("🤖 OpenAI Provider initialized (Whisper + GPT-4o-mini)");
  } catch (err) {
    console.error("⚠️ Failed to init OpenAI client:", err.message);
  }
}

// Detect active provider
function getActiveProvider() {
  if (USE_MOCK_AI) return "mock";
  if (geminiClient) return "gemini";
  if (groqClient) return "groq";
  if (openaiClient) return "openai";
  return "mock";
}

console.log(`🎯 Active AI Engine: ${getActiveProvider().toUpperCase()}`);

// ============================================
// Helper: Audio Mime Type
// ============================================

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".webm":
      return "audio/webm";
    case ".mp3":
      return "audio/mp3";
    case ".wav":
      return "audio/wav";
    case ".m4a":
      return "audio/mp4";
    case ".ogg":
      return "audio/ogg";
    case ".flac":
      return "audio/flac";
    default:
      return "audio/webm";
  }
}

// ============================================
// Heuristic Fallback Result
// ============================================

function generateHeuristicResult(transcript) {
  const text = transcript.trim();
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  let summary = text;
  if (summary.length > 250) {
    summary = summary.substring(0, 250) + "...";
  }

  const keyPoints =
    sentences.length > 0 ? sentences.slice(0, 5) : ["No key points detected."];

  const actionItems = [];
  const lowerText = text.toLowerCase();

  if (lowerText.includes("finish") || lowerText.includes("complete")) {
    actionItems.push({ task: "Complete the project", priority: "High" });
  }
  if (lowerText.includes("report") || lowerText.includes("prepare")) {
    actionItems.push({ task: "Prepare the project report", priority: "High" });
  }
  if (lowerText.includes("send") || lowerText.includes("share")) {
    actionItems.push({ task: "Send the completed work to the team", priority: "Medium" });
  }
  if (lowerText.includes("tomorrow") || lowerText.includes("today")) {
    actionItems.push({ task: "Complete the planned work within the mentioned deadline", priority: "High" });
  }
  if (actionItems.length === 0) {
    actionItems.push({ task: "Review the discussed tasks", priority: "Medium" });
  }

  const decisions = [];
  if (lowerText.includes("need to") || lowerText.includes("plan to") || lowerText.includes("decided")) {
    decisions.push("The discussed tasks should be completed and tracked.");
  }
  if (decisions.length === 0) {
    decisions.push("No specific decisions were detected.");
  }

  return { summary, keyPoints, actionItems, decisions };
}

// ============================================
// Real Speech-to-Text Transcription
// ============================================

async function transcribeAudioFile(audioPath) {
  if (USE_MOCK_AI) {
    console.log("🧪 Mock mode enabled, returning mock transcript");
    return {
      text:
        "This is a sample transcript generated for testing. " +
        "The user wants to complete the project, prepare the report, and share the completed work with the team.",
      mock: true,
      provider: "mock",
    };
  }

  // 1. Try Google Gemini (Gemini 2.0 Flash)
  if (geminiClient) {
    try {
      console.log("🌟 Transcribing audio with Google Gemini 2.0 Flash...");
      const audioBuffer = fs.readFileSync(audioPath);
      const mimeType = getMimeType(audioPath);

      const response = await geminiClient.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            inlineData: {
              mimeType: mimeType,
              data: audioBuffer.toString("base64"),
            },
          },
          {
            text: "Transcribe the speech in this audio file accurately word-for-word. Return only the raw transcript text. Do not add explanations, greetings, or formatting.",
          },
        ],
      });

      const text = response.text ? response.text.trim() : "";
      if (text) {
        console.log("✅ Google Gemini transcription successful!");
        return { text, mock: false, provider: "gemini" };
      }
    } catch (geminiError) {
      console.error("⚠️ Google Gemini transcription error:", geminiError.message);
    }
  }

  // 2. Try Groq (Whisper large v3 turbo)
  if (groqClient) {
    try {
      console.log("⚡ Transcribing audio with Groq Whisper...");
      const transcription = await groqClient.audio.transcriptions.create({
        file: fs.createReadStream(audioPath),
        model: "whisper-large-v3-turbo",
      });

      if (transcription.text) {
        console.log("✅ Groq transcription successful!");
        return { text: transcription.text.trim(), mock: false, provider: "groq" };
      }
    } catch (groqError) {
      console.error("⚠️ Groq transcription error:", groqError.message);
    }
  }

  // 3. Try OpenAI (Whisper-1)
  if (openaiClient) {
    try {
      console.log("🤖 Transcribing audio with OpenAI Whisper-1...");
      const transcription = await openaiClient.audio.transcriptions.create({
        file: fs.createReadStream(audioPath),
        model: "whisper-1",
      });

      if (transcription.text) {
        console.log("✅ OpenAI transcription successful!");
        return { text: transcription.text.trim(), mock: false, provider: "openai" };
      }
    } catch (openaiError) {
      console.error("⚠️ OpenAI transcription error:", openaiError.message);
    }
  }

  // Fallback
  console.log("🔄 Using fallback mock transcript...");
  return {
    text:
      "This is a fallback transcript generated because real AI speech-to-text is currently unavailable. " +
      "The user wants to complete the project, prepare the report, and share the completed work with the team.",
    mock: true,
    provider: "fallback",
  };
}

// ============================================
// Real Structured Summary & Action Items
// ============================================

async function generateStructuredSummary(transcript) {
  const text = transcript.trim();

  if (USE_MOCK_AI) {
    console.log("🧪 Mock mode enabled, generating heuristic summary");
    return {
      ...generateHeuristicResult(text),
      mock: true,
      provider: "mock",
    };
  }

  const systemPrompt =
    "You are an expert AI productivity assistant. Analyze the given speech transcript and extract structured intelligence.\n" +
    "Return a valid JSON object with the following exact keys:\n" +
    "- summary (string): A concise, well-written executive summary (2-3 sentences).\n" +
    "- keyPoints (array of strings): 2 to 5 distinct highlights and key points.\n" +
    "- actionItems (array of objects): Each with 'task' (string description) and 'priority' ('High', 'Medium', or 'Low').\n" +
    "- decisions (array of strings): Key decisions or agreed-upon points made in the discussion.\n" +
    "Ensure all fields are populated with helpful and accurate insights from the transcript.";

  // 1. Try Google Gemini (Gemini 2.0 Flash)
  if (geminiClient) {
    try {
      console.log("🌟 Generating structured summary with Google Gemini 2.0 Flash...");
      const response = await geminiClient.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          { text: systemPrompt },
          { text: `Transcript:\n"""\n${text}\n"""` },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });

      const rawJson = response.text ? response.text.trim() : "{}";
      const parsed = JSON.parse(rawJson);

      return {
        summary: parsed.summary || text.substring(0, 250),
        keyPoints: Array.isArray(parsed.keyPoints) && parsed.keyPoints.length > 0
          ? parsed.keyPoints
          : ["No key points detected."],
        actionItems: Array.isArray(parsed.actionItems) && parsed.actionItems.length > 0
          ? parsed.actionItems
          : [{ task: "Review the discussion", priority: "Medium" }],
        decisions: Array.isArray(parsed.decisions) && parsed.decisions.length > 0
          ? parsed.decisions
          : ["No specific decisions detected."],
        mock: false,
        provider: "gemini",
      };
    } catch (geminiError) {
      console.error("⚠️ Google Gemini summary error:", geminiError.message);
    }
  }

  // 2. Try Groq (Llama 3.3 70B)
  if (groqClient) {
    try {
      console.log("⚡ Generating structured summary with Groq Llama 3.3...");
      const completion = await groqClient.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Transcript:\n"""\n${text}\n"""` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const rawContent = completion.choices[0]?.message?.content;
      const parsed = JSON.parse(rawContent || "{}");

      return {
        summary: parsed.summary || text.substring(0, 250),
        keyPoints: Array.isArray(parsed.keyPoints) && parsed.keyPoints.length > 0
          ? parsed.keyPoints
          : ["No key points detected."],
        actionItems: Array.isArray(parsed.actionItems) && parsed.actionItems.length > 0
          ? parsed.actionItems
          : [{ task: "Review the discussion", priority: "Medium" }],
        decisions: Array.isArray(parsed.decisions) && parsed.decisions.length > 0
          ? parsed.decisions
          : ["No specific decisions detected."],
        mock: false,
        provider: "groq",
      };
    } catch (groqError) {
      console.error("⚠️ Groq summary error:", groqError.message);
    }
  }

  // 3. Try OpenAI (GPT-4o-mini)
  if (openaiClient) {
    try {
      console.log("🤖 Generating structured summary with OpenAI GPT-4o-mini...");
      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Transcript:\n"""\n${text}\n"""` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const rawContent = completion.choices[0]?.message?.content;
      const parsed = JSON.parse(rawContent || "{}");

      return {
        summary: parsed.summary || text.substring(0, 250),
        keyPoints: Array.isArray(parsed.keyPoints) && parsed.keyPoints.length > 0
          ? parsed.keyPoints
          : ["No key points detected."],
        actionItems: Array.isArray(parsed.actionItems) && parsed.actionItems.length > 0
          ? parsed.actionItems
          : [{ task: "Review the discussion", priority: "Medium" }],
        decisions: Array.isArray(parsed.decisions) && parsed.decisions.length > 0
          ? parsed.decisions
          : ["No specific decisions detected."],
        mock: false,
        provider: "openai",
      };
    } catch (openaiError) {
      console.error("⚠️ OpenAI summary error:", openaiError.message);
    }
  }

  // Fallback
  console.log("🔄 Using fallback heuristic summary...");
  return {
    ...generateHeuristicResult(text),
    mock: true,
    provider: "fallback",
  };
}

module.exports = {
  transcribeAudioFile,
  generateStructuredSummary,
  generateHeuristicResult,
  getActiveProvider,
};
