import { GoogleGenAI, Type } from '@google/genai';
import { College, GroundingChunk } from '../types';

export const harvestEmails = async (province: string, university: string, faculty: string, apiKey: string): Promise<{ colleges: College[], sources: GroundingChunk[] }> => {
  if (!apiKey) {
    throw new Error('Gemini API key is not provided.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const facultyFilter = faculty ? `The colleges MUST specifically offer programs or degrees related to ${faculty}.` : '';

  const prompt = `
    Act as an expert data researcher. Your task is to perform an extensive and deep search to find official email addresses for colleges in Nepal.
    The colleges MUST be located in ${province} province and be affiliated with ${university}.
    ${facultyFilter}
    Search official websites, educational portals, and Google Maps listings to find the data.
    Find the college's full official name and an array of up to two official contact email addresses.
    If you cannot find any email for a specific college, the "emails" array MUST be empty. Do not invent emails.
    Only include colleges that strictly match all the criteria (province, university, and faculty if specified).
  `;

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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: collegeSchema,
        },
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
    const textResponse = response.text.trim();
    
    if (!textResponse) {
      return { colleges: [], sources };
    }
    
    const parsedData = JSON.parse(textResponse);

    if (Array.isArray(parsedData)) {
      return { colleges: parsedData as College[], sources };
    } else {
      throw new Error('Unexpected data format received from API.');
    }
  } catch (error) {
    console.error('Error fetching data from Gemini API:', error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
        throw new Error('Your Gemini API key is not valid. Please check and try again.');
    }
    throw new Error('Failed to fetch data from Gemini API. Check your API key, the prompt, and the console for more details.');
  }
};