import OpenAI from 'openai';
import Constants from 'expo-constants';

// Define the expected structure of the summary
export interface StructuredSummary {
  sermonType: "Sunday Sermon" | "Bible Study" | "Youth Service" | "Other";
  overview: string;
  scriptures: string[];
  keyPoints: string[];
}

// Retrieve API key from environment variables
// Note: Make sure OPENAI_API_KEY is defined in app.json's "extra" field
// or loaded via another mechanism expo-constants can access.
const apiKey = Constants.expoConfig?.extra?.OPENAI_API_KEY;

let openai: OpenAI | null = null;
if (typeof apiKey === 'string' && apiKey) {
  openai = new OpenAI({ apiKey });
} else {
  console.warn('OpenAI API key not found or invalid. Please set OPENAI_API_KEY in your app config (e.g., app.json extra field) and ensure it is a string.');
}

/**
 * Generates a structured summary of a sermon transcript using OpenAI.
 * @param transcript The full sermon transcript text.
 * @returns A promise resolving to the StructuredSummary object, or throwing an error if unsuccessful.
 */
export async function generateSermonSummary(
  transcript: string
): Promise<StructuredSummary> {
  if (!openai) {
    throw new Error('OpenAI client is not initialized. Cannot generate summary.');
  }

  if (!transcript || transcript.trim().length === 0) {
    throw new Error('Cannot summarize an empty transcript.');
  }

  const systemPrompt = `You are a discerning and spiritually sensitive assistant summarizing a live sermon. First, determine the type of sermon based on tone, structure, and delivery cues. Then provide a warm, theologically grounded summary of the message. Focus on what was actually said—do not infer or fabricate meaning.

STEP 1: Sermon Type Detection
Classify the sermon into one of the following categories based on tone, style, and structure:
- "Sunday Sermon": Typically delivered in a main worship service, inspirational or exhortational in tone.
- "Bible Study": Slower-paced, teaching style, more scripture exposition, often interactive or detailed.
- "Youth Service": More casual tone, modern language, culturally aware references, simplified theological language.
- "Other"

STEP 2: Summary Content
1. **Overview**: Write a warm, 3–5 sentence overview of the sermon's main message. Reflect the style of delivery. Be concise, thoughtful, and grounded in what was actually preached.
2. **Scriptures**: List only the scripture references clearly mentioned in the sermon (e.g., "John 3:16"). If none, return an empty array.
3. **Key Points**: List 3–5 major takeaways or core ideas that the preacher emphasized. Avoid assumptions or added interpretations.

IMPORTANT:
- DO NOT fabricate scripture or ideas that weren't said.
- Keep tone spiritually grounded, insightful, and reflective of the speaker's delivery.

Return a single JSON object in the following format. DO NOT include markdown or commentary.

{
  "sermonType": "Sunday Sermon" | "Bible Study" | "Youth Service" | "Other",
  "overview": "...",
  "scriptures": ["...", "..."],
  "keyPoints": ["...", "..."]
}`;

  const userPrompt = `Sermon Transcript:\n\n"""\n${transcript}\n"""`;

  try {
    console.log('[openai.ts] Sending request to OpenAI...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-0125', // Or gpt-4
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });

    const content = completion.choices[0]?.message?.content;
    console.log('[openai.ts] Received response content:', content);

    if (!content) {
      throw new Error('AI failed to generate a summary (empty response).');
    }

    try {
      const parsedSummary = JSON.parse(content) as Partial<StructuredSummary>;
      const allowedSermonTypes = ["Sunday Sermon", "Bible Study", "Youth Service", "Other"];
      
      if (
        typeof parsedSummary.sermonType === 'string' &&
        allowedSermonTypes.includes(parsedSummary.sermonType) &&
        typeof parsedSummary.overview === 'string' &&
        Array.isArray(parsedSummary.scriptures) &&
        parsedSummary.scriptures.every(s => typeof s === 'string') &&
        Array.isArray(parsedSummary.keyPoints) &&
        parsedSummary.keyPoints.every(p => typeof p === 'string') 
      ) {
        console.log('[openai.ts] Successfully parsed summary.');
        return parsedSummary as StructuredSummary;
      } else {
        console.error('[openai.ts] OpenAI response JSON did not match expected structure or had invalid sermonType:', parsedSummary);
        throw new Error('Invalid summary format received from AI.');
      }
    } catch (parseError) {
      console.error('[openai.ts] Failed to parse OpenAI JSON response:', parseError, 'Raw content:', content);
      throw new Error('Could not understand the summary from the AI.');
    }

  } catch (error: any) {
    console.error('[openai.ts] Error calling OpenAI API:', error);
    const message = error.response?.data?.error?.message || error.message || 'An unknown error occurred during summarization.';
    throw new Error(message);
  }
}