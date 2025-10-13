
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
    // Call the Gemini API to generate content.
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', // Use the latest available model.
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: collegeSchema,
        },
      },
      tools: [{googleSearch: {}}], // Enable Google Search for grounding.
    });

    // Extract the data sources from the response.
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
    // Extract the text response.
    const textResponse = response.text.trim();
    
    // If the response is empty, return an empty array.
    if (!textResponse) {
      return { colleges: [], sources };
    }
    
    // Parse the JSON response.
    const parsedData = JSON.parse(textResponse);

    // Ensure the parsed data is an array and return it.
    if (Array.isArray(parsedData)) {
      return { colleges: parsedData as College[], sources };
    } else {
      throw new Error('Unexpected data format received from API.');
    }
  } catch (error) {
    console.error('Error fetching data from Gemini API:', error);
    // Handle specific API key errors.
    if (error instanceof Error && error.message.includes('API key not valid')) {
        throw new Error('Your Gemini API key is not valid. Please check and try again.');
    }
    // Throw a generic error for other issues.
    throw new Error('Failed to fetch data from Gemini API. Check your API key, the prompt, and the console for more details.');
  }
};
