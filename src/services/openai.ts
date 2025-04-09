import OpenAI from 'openai';
import Constants from 'expo-constants';

// Define the expected structure of the summary
export interface StructuredSummary {
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

  const systemPrompt = `You are an AI assistant tasked with summarizing sermon transcripts. Analyze the provided transcript and generate a structured summary. The summary must have three sections: "Overview" (string), "Scriptures" (array of strings, use full references like "John 3:16"), and "Key points" (array of strings).

Instructions:
1.  **Overview:** Write a concise, single-paragraph summary of the sermon's main message and theme.
2.  **Scriptures:** List the primary scripture references mentioned (e.g., "John 3:16", "Romans 8:28"). If no specific references are mentioned, the array should be empty ([]).
3.  **Key points:** Identify and list the main points, arguments, or takeaways from the sermon as a bulleted list (aim for 3-5 points).

Respond ONLY with a valid JSON object adhering exactly to this format (do not include markdown formatting like \`\`\`json):
{
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
      const parsedSummary: StructuredSummary = JSON.parse(content);
      // Basic validation
      if (
        typeof parsedSummary.overview === 'string' &&
        Array.isArray(parsedSummary.scriptures) &&
        parsedSummary.scriptures.every(s => typeof s === 'string') && // Check array elements
        Array.isArray(parsedSummary.keyPoints) &&
        parsedSummary.keyPoints.every(p => typeof p === 'string') // Check array elements
      ) {
        console.log('[openai.ts] Successfully parsed summary.');
        return parsedSummary;
      } else {
        console.error('[openai.ts] OpenAI response JSON did not match expected structure:', parsedSummary);
        throw new Error('Invalid summary format received from AI.');
      }
    } catch (parseError) {
      console.error('[openai.ts] Failed to parse OpenAI JSON response:', parseError, 'Raw content:', content);
      throw new Error('Could not understand the summary from the AI.');
    }

  } catch (error: any) {
    console.error('[openai.ts] Error calling OpenAI API:', error);
    const message = error.response?.data?.error?.message || error.message || 'An unknown error occurred during summarization.';
    // Re-throw the specific error message
    throw new Error(message);
  }
}