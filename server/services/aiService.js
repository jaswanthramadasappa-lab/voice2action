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
// Dynamic NLP & Intent Extraction Engine
// ============================================

function generateDynamicSmartAnalysis(transcript) {
  const text = (transcript || "").trim();
  if (!text) {
    return {
      summary: "No transcript content provided.",
      keyPoints: ["No key points detected."],
      actionItems: [{ task: "Provide voice or text input", priority: "Low" }],
      decisions: ["No decisions detected."],
    };
  }

  // Split into clean individual sentences
  const rawSentences = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim().replace(/^[-•*]\s*/, ""))
    .filter((s) => s.length > 3);

  // 1. DYNAMIC SUMMARY
  let summary = "";
  if (rawSentences.length === 1) {
    summary = `The discussion focused on: ${text}`;
  } else if (rawSentences.length === 2) {
    summary = `${rawSentences[0]} Furthermore, ${rawSentences[1].charAt(0).toLowerCase() + rawSentences[1].slice(1)}`;
  } else {
    const mainTopic = rawSentences[0];
    const keyAction = rawSentences[1] || "";
    const conclusion = rawSentences[rawSentences.length - 1];
    summary = `${mainTopic} The team outlined necessary next steps (${keyAction.replace(/[.!?]+$/, "")}) with the goal to ${conclusion.replace(/^[A-Z]/, (c) => c.toLowerCase())}`;
  }

  // Clean summary formatting
  if (!/[.!?]$/.test(summary)) summary += ".";

  // 2. DYNAMIC KEY POINTS
  const keyPoints = [];
  rawSentences.forEach((sentence) => {
    if (sentence.length > 5 && keyPoints.length < 5) {
      const clean = sentence.replace(/^[,\s]+/, "").replace(/[.]+$/, "");
      keyPoints.push(clean.charAt(0).toUpperCase() + clean.slice(1));
    }
  });

  if (keyPoints.length === 0) {
    keyPoints.push(text.charAt(0).toUpperCase() + text.slice(1));
  }

  // 3. DYNAMIC ACTION ITEMS
  const actionItems = [];
  const actionVerbsRegex =
    /\b(need to|needs to|must|will|should|have to|has to|going to|plan to|plans to|assigned to|please|task is to|action item:?|follow up on|work on|prepare|complete|finish|create|implement|deploy|review|send|share|schedule|submit|contact|update|design|develop|fix|build|write|email|call|organize|verify|finalize|coordinate)\b/i;

  rawSentences.forEach((sentence) => {
    const lower = sentence.toLowerCase();

    if (actionVerbsRegex.test(sentence)) {
      // Determine priority based on urgency keywords in the sentence
      let priority = "Medium";
      if (
        /\b(urgent|immediately|asap|critical|high priority|today|emergency|now|vital)\b/i.test(lower)
      ) {
        priority = "High";
      } else if (
        /\b(tomorrow|friday|monday|tuesday|wednesday|thursday|weekend|this week|must|deadline|important)\b/i.test(lower)
      ) {
        priority = "High";
      } else if (
        /\b(low priority|whenever|eventually|optional|later|if time permits|minor|sometime)\b/i.test(lower)
      ) {
        priority = "Low";
      }

      // Format task text
      let taskText = sentence.replace(/[.!?]+$/, "").trim();
      taskText = taskText.charAt(0).toUpperCase() + taskText.slice(1);

      // Avoid duplicates
      if (!actionItems.some((item) => item.task.toLowerCase() === taskText.toLowerCase())) {
        actionItems.push({
          task: taskText,
          priority: priority,
        });
      }
    }
  });

  // If no action items found via triggers, construct an actionable item from the main discussion
  if (actionItems.length === 0 && rawSentences.length > 0) {
    const mainSentence = rawSentences[0].replace(/[.!?]+$/, "").trim();
    actionItems.push({
      task: `Execute and review: ${mainSentence.charAt(0).toUpperCase() + mainSentence.slice(1)}`,
      priority: "Medium",
    });
  }

  // 4. DYNAMIC DECISIONS
  const decisions = [];
  const decisionRegex =
    /\b(decided|agreed|concluded|chosen|resolved|settled on|confirmed|final decision|approved|selected|agreed to|decided to)\b/i;

  rawSentences.forEach((sentence) => {
    if (decisionRegex.test(sentence)) {
      const cleanDecision = sentence.replace(/[.!?]+$/, "").trim();
      decisions.push(cleanDecision.charAt(0).toUpperCase() + cleanDecision.slice(1));
    }
  });

  if (decisions.length === 0) {
    if (rawSentences.length > 1) {
      decisions.push(`Agreed to execute the outlined steps for "${rawSentences[0].replace(/[.!?]+$/, "")}".`);
    } else {
      decisions.push(`Recorded and approved the action plan as stated.`);
    }
  }

  return {
    summary,
    keyPoints,
    actionItems,
    decisions,
  };
}

function generateHeuristicResult(transcript) {
  return generateDynamicSmartAnalysis(transcript);
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
