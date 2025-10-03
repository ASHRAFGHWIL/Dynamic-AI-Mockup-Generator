import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * A centralized error handler for API calls. It logs the original error
 * and returns a more user-friendly Error object.
 * @param error The original error caught.
 * @param context A string describing the operation that failed (e.g., "generating base image").
 * @returns A new Error with a user-friendly message.
 */
const handleApiError = (error: unknown, context: string): Error => {
  console.error(`Error during ${context}:`, error); // Log the full technical error for debugging

  // If the error is already a user-friendly message from a higher-level check, just pass it through.
  if (error instanceof Error && (
      error.message.startsWith('The API did not return') ||
      error.message.startsWith('The model refused')
    )) {
    return error;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('api_key') || message.includes('permission_denied')) {
      return new Error('Authentication failed. Please check your API key and permissions.');
    }
    
    // Improved quota/billing handling
    if (message.includes('quota') || message.includes('billing') || message.includes('resource_exhausted') || message.includes('429')) {
      return new Error('API quota exceeded. Please check your plan and billing details. This might be a temporary rate limit, so you can also try again in a moment.');
    }

    if (message.includes('safety')) {
      return new Error(`The request was blocked for safety reasons during ${context}. Please try a different prompt or design.`);
    }

    if (message.includes('deadline_exceeded')) {
        return new Error('The request timed out. Please try again.');
    }

    // This catches specific model refusals that are part of the main error message.
    if (message.includes('response was blocked')) {
        return new Error(`The model's response was blocked, likely due to safety filters. Try adjusting your prompt. Context: ${context}.`);
    }

    // Generic fallback for other API errors
    return new Error(`An API error occurred while ${context}. Please try again later.`);
  }

  // Fallback for unexpected, non-Error exceptions
  return new Error(`An unexpected error occurred during ${context}.`);
};


/**
 * Generates base image scene variations using a text prompt.
 * @param prompt The text prompt to generate the images from.
 * @param aspectRatio The desired aspect ratio for the generated images.
 * @param numberOfImages The number of image variations to generate.
 * @returns An array of base64 encoded strings of the generated PNG images.
 * @throws An error with a user-friendly message if the API call fails.
 */
export const generateBaseImage = async (prompt: string, aspectRatio: string, numberOfImages: number): Promise<string[]> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: numberOfImages,
        outputMimeType: 'image/png',
        aspectRatio: aspectRatio,
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages.map(img => img.image.imageBytes);
    }
    
    throw new Error("The API did not return any images. This could be due to the prompt being too restrictive or a safety policy violation.");
  } catch (error) {
    throw handleApiError(error, "generating base scene");
  }
};

/**
 * Edits a base image by inserting a design image based on a text prompt.
 * @param baseImageB64 The base64 encoded base image.
 * @param designImageB64 The base64 encoded design image to insert.
 * @param designMimeType The MIME type of the design image.
 * @param prompt The text prompt guiding the edit.
 * @returns A base64 encoded string of the final edited PNG image.
 * @throws An error with a user-friendly message if the API call fails.
 */
export const editImage = async (
  baseImageB64: string,
  designImageB64: string,
  designMimeType: string,
  prompt: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: baseImageB64, mimeType: 'image/png' } },
          { inlineData: { data: designImageB64, mimeType: designMimeType } },
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    const textPart = response.candidates[0].content.parts.find(p => p.text);
    if (textPart && textPart.text) {
        throw new Error(`The model refused to edit the image: ${textPart.text}`);
    }

    throw new Error("The API did not return an edited image.");
  } catch (error) {
    throw handleApiError(error, "compositing design");
  }
};

/**
 * Applies an artistic style to an image using a text prompt.
 * @param baseImageB64 The base64 encoded image to style (PNG format).
 * @param stylePrompt The text prompt describing the artistic style to apply.
 * @returns A base64 encoded string of the final styled PNG image.
 * @throws An error with a user-friendly message if the API call fails.
 */
export const applyArtisticStyle = async (
  baseImageB64: string,
  stylePrompt: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: baseImageB64, mimeType: 'image/png' } },
          { text: stylePrompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    const textPart = response.candidates[0].content.parts.find(p => p.text);
    if (textPart && textPart.text) {
        throw new Error(`The model refused to apply the style: ${textPart.text}`);
    }

    throw new Error("The API did not return a styled image.");
  } catch (error) {
    throw handleApiError(error, "applying artistic style");
  }
};