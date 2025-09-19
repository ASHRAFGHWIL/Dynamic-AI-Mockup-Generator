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
  console.error(`Error during ${context}:`, error);

  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    
    // Check for specific, common API errors
    if (errorMessage.includes('api_key_invalid') || errorMessage.includes('permission_denied')) {
      return new Error('API key is invalid or missing permissions. Please check your configuration.');
    }
    if (errorMessage.includes('safety')) {
      return new Error(`Request blocked for safety reasons during ${context}. Try a different prompt or image.`);
    }
    if (errorMessage.includes('billing')) {
      return new Error('There seems to be a billing issue with your account. Please verify your Google Cloud project settings.');
    }
    if (errorMessage.includes('not found')) {
        return new Error(`The requested model could not be found. Context: ${context}.`);
    }

    // For general API errors or soft refusals from the model, pass the message along.
    return new Error(`Failed to ${context.replace(/ing/,'e')}: ${error.message}`);
  }

  // Fallback for unexpected, non-Error exceptions
  return new Error(`An unexpected error occurred during ${context}.`);
};


/**
 * Generates base image scene variations using a text prompt.
 * @param prompt The text prompt to generate the images from.
 * @param aspectRatio The desired aspect ratio for the generated images.
 * @returns An array of base64 encoded strings of the generated PNG images.
 * @throws An error with a user-friendly message if the API call fails.
 */
export const generateBaseImage = async (prompt: string, aspectRatio: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 3,
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
      model: 'gemini-2.5-flash-image-preview',
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
      model: 'gemini-2.5-flash-image-preview',
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