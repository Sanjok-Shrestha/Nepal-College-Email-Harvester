
import { GoogleGenAI, Type } from '@google/genai';
import { College, GroundingChunk } from '../types';

/**
 * This service function interacts with the Gemini AI to find college email addresses.
 * @param province The province to search for colleges in.
 * @param university The university the colleges should be affiliated with.
 * @param faculty The faculty or program to filter by (optional).
 * @param apiKey The user's Gemini API key.
 * @returns A promise that resolves to an object containing the list of colleges and the data sources.
 */
export const harvestEmails = async (province: string, university: string, faculty: string, apiKey: string): Promise<{ colleges: College[], sources: GroundingChunk[] }> => {
  // Ensure an API key is provided.
  if (!apiKey) {
    throw new Error('Gemini API key is not provided.');
  }

  // Initialize the GoogleGenAI client with the provided API key.
  const ai = new GoogleGenAI({ apiKey });

  // Create a filter for the faculty if one is provided.
  const facultyFilter = faculty ? `The colleges MUST specifically offer programs or degrees related to ${faculty}.` : '';

  // Construct the prompt for the Gemini AI model.
  const prompt = `
    Act as an expert data researcher. Your task is to perform an extensive and deep search to find official email addresses for colleges in Nepal.
    The colleges MUST be located in ${province} province and be affiliated with ${university}.
    ${facultyFilter}
    Search official websites, educational portals, and Google Maps listings to find the data.
    Find the college's full official name and an array of up to two official contact email addresses.
    If you cannot find any email for a specific college, the "emails" array MUST be empty. Do not invent emails.
    Only include colleges that strictly match all the criteria (province, university, and faculty if specified).
  `;

  // Define the expected JSON schema for the AI's response.
  const collegeSchema = {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: "The college's full official name.",
      },
      emails: {
        type: Type.ARRAY,
        description: "An array of up to two official contact email addresses.",
        items: {
          type: Type.STRING,
        },
      },
    },
    required: ['name', 'emails'],
  };

  try {
    // Build params as plain object and cast to any to avoid SDK typing mismatches.
    const params: any = {
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      // put generation options in generationConfig (casted to any so TS won't complain)
      generationConfig: { temperature: 0.1 },
      tools: [{ googleSearch: {} }],
    };

    // Cast call params/response to `any` to allow accessing different SDK shapes without TS errors.
    const response = await ai.models.generateContent(params);
    const resAny = response as any;

    // safe extraction of grounding/sources across SDK shapes (use `any` to avoid type errors)
    const sources =
      (resAny?.candidates?.[0]?.groundingMetadata?.groundingChunks ||
        resAny?.candidates?.[0]?.grounding?.groundingChunks ||
        resAny?.groundingMetadata?.groundingChunks ||
        resAny?.groundingChunks) as GroundingChunk[] || [];

    // robust text extraction across multiple SDK shapes
    const extractText = (r: any): string => {
      if (!r) return '';
      if (typeof r.text === 'string' && r.text.trim()) return r.text.trim();
      if (typeof r.outputText === 'string' && r.outputText.trim()) return r.outputText.trim();

      const candidate = r.candidates?.[0] ?? r.outputs?.[0] ?? null;
      if (!candidate) return '';

      const content = candidate.content ?? candidate.message?.content ?? candidate;
      if (Array.isArray(content)) {
        const parts = content
          .map((p: any) => (typeof p?.text === 'string' ? p.text : typeof p === 'string' ? p : ''))
          .filter(Boolean);
        return parts.join('\n').trim();
      }
      if (typeof content === 'string' && content.trim()) return content.trim();
      if (typeof candidate.text === 'string' && candidate.text.trim()) return candidate.text.trim();
      return '';
    };

    const textResponse = extractText(resAny);
    if (!textResponse) {
      return { colleges: [], sources };
    }

    // safe parse: try direct parse, then try to extract first JSON array substring
    let parsedData: any = null;
    try {
      parsedData = JSON.parse(textResponse);
    } catch {
      const first = textResponse.indexOf('[');
      const last = textResponse.lastIndexOf(']');
      if (first !== -1 && last !== -1 && last > first) {
        try {
          parsedData = JSON.parse(textResponse.slice(first, last + 1));
        } catch {
          parsedData = null;
        }
      }
    }

    // if parsing failed, try structured outputs from SDK (use `any` accesses)
    if (!Array.isArray(parsedData)) {
      const structured =
        resAny?.candidates?.[0]?.structuredOutput ??
        resAny?.candidates?.[0]?.json ??
        resAny?.outputs?.[0]?.structuredOutput;
      if (Array.isArray(structured)) {
        parsedData = structured;
      }
    }

    if (!Array.isArray(parsedData)) {
      throw new Error('Unexpected data format received from API. Could not parse JSON array from the model output.');
    }

    // sanitize and return
    const sanitized: College[] = parsedData
      .map((item: any) => {
        const name = typeof item?.name === 'string' ? item.name.trim() : '';
        let emails: string[] = [];
        if (Array.isArray(item?.emails)) {
          // Step 1: Filter to only strings
          const stringEmails = item.emails.filter((e: any) => typeof e === 'string');
          // Step 2: Trim whitespace
          const trimmedEmails = stringEmails.map((s: string) => s.trim());
          // Step 3: Deduplicate
          const uniqueEmails = Array.from(new Set(trimmedEmails));
          // Step 4: Limit to two emails
          emails = uniqueEmails.slice(0, 2);
        }
        return { name, emails };
      })
      .filter((c: College) => c.name);

    return { colleges: sanitized, sources };
  } catch (error: any) {
    console.error('Error fetching data from Gemini API:', error);
    const msg = (error && error.message) ? error.message : String(error);
    if (msg.toLowerCase().includes('api key') && msg.toLowerCase().includes('invalid')) {
      throw new Error('Your Gemini API key is not valid. Please check and try again.');
    }
    throw new Error('Failed to fetch data from Gemini API. Check your API key, network, and console for more details.');
  }
};
