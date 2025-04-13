"use server";

import { generateText, generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { error } from "console";
import { currentUser } from "@clerk/nextjs/server";
import { client } from "@/lib/prisma";
import { data } from "@/lib/constants";
import { v4 as uuidv4 } from "uuid";
import { ContentItem, ContentType, Slide } from "@/lib/types";

const googleAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

export const generateCreativePrompt = async (userPrompt: string) => {
  const googleAI = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY!,
  });
  const finalPrompt = `
Create a coherent and relevant outline for the following prompt: ${userPrompt}.
The outline should consist of at least 6 points ( but not 7 unless asked), with each point written as a single sentence.
Ensure the outline is well-structured and directly related to the topic.

Return ONLY the output in this exact plain JSON format — no explanation, no markdown:
{
  "outlines": [
    "Point 1",
    "Point 2",
    "Point 3",
    "Point 4",
    "Point 5",
    "Point 6"
  ]
}
Do NOT wrap the response in triple backticks or markdown formatting. Return ONLY valid JSON.
`;

  try {
    const result = await generateText({
      model: googleAI("models/gemini-1.5-flash"),
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI that generates outlines for presentations.",
        },
        {
          role: "user",
          content: finalPrompt,
        },
      ],

      temperature: 0.0,
      maxTokens: 1000,
    });

    const rawOutput = result.text.trim();

    // Sanitize and extract valid JSON from possible markdown wrappers
    const cleanedOutput = rawOutput
      .replace(/```json|```/g, "") // Remove markdown code fences
      .trim();

    // Fallback: extract JSON body just in case extra stuff is still there
    const jsonMatch = cleanedOutput.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in the response.");
    }

    const jsonResponse = JSON.parse(jsonMatch[0]);
    return { status: 200, data: jsonResponse };
  } catch (error) {
    console.error("❌ Failed to parse Gemini response:", error);
    return { status: 500, error: "Failed to generate valid JSON from AI." };
  }
};

const existingLayouts = [
  {
    id: uuidv4(),
    slideName: "Blank card",
    type: "blank-card",
    className: "p-8 mx-auto flex justify-center items-center min-h-[200px]",
    content: {
      id: uuidv4(),
      type: "column" as ContentType,
      name: "Column",
      content: [
        {
          id: uuidv4(),
          type: "title" as ContentType,
          name: "Title",
          content: "",
          placeholder: "Untitled Card",
        },
      ],
    },
  },

  {
    id: uuidv4(),
    slideName: "Accent left",
    type: "accentLeft",
    className: "min-h-[300px]",
    content: {
      id: uuidv4(),
      type: "column" as ContentType,
      name: "Column",
      restrictDropTo: true,
      content: [
        {
          id: uuidv4(),
          type: "resizable-column" as ContentType,
          name: "Resizable column",
          restrictToDrop: true,
          content: [
            {
              id: uuidv4(),
              type: "image" as ContentType,
              name: "Image",
              content:
                "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
              alt: "Title",
            },
            {
              id: uuidv4(),
              type: "column" as ContentType,
              name: "Column",
              content: [
                {
                  id: uuidv4(),
                  type: "heading1" as ContentType,
                  name: "Heading1",
                  content: "",
                  placeholder: "Heading1",
                },
                {
                  id: uuidv4(),
                  type: "paragraph" as ContentType,
                  name: "Paragraph",
                  content: "",
                  placeholder: "start typing here",
                },
              ],
              className: "w-full h-full p-8 flex justify-center items-center",
              placeholder: "Heading1",
            },
          ],
        },
      ],
    },
  },

  {
    id: uuidv4(),
    slideName: "Accent Right",
    type: "accentRight",
    className: "min-h-[300px]",
    content: {
      id: uuidv4(),
      type: "column" as ContentType,
      name: "Column",
      content: [
        {
          id: uuidv4(),
          type: "resizable-column" as ContentType,
          name: "Resizable column",
          restrictToDrop: true,
          content: [
            {
              id: uuidv4(),
              type: "column" as ContentType,
              name: "Column",
              content: [
                {
                  id: uuidv4(),
                  type: "heading1" as ContentType,
                  name: "Heading1",
                  content: "",
                  placeholder: "Heading1",
                },
                {
                  id: uuidv4(),
                  type: "paragraph" as ContentType,
                  name: "Paragraph",
                  content: "",
                  placeholder: "start typing here",
                },
              ],
              className: "w-full h-full p-8 flex justify-center items-center",
              placeholder: "Heading1",
            },
            {
              id: uuidv4(),
              type: "image" as ContentType,
              name: "Image",
              restrictToDrop: true,
              content:
                "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
              alt: "Title",
            },
          ],
        },
      ],
    },
  },

  {
    id: uuidv4(),
    slideName: "Image and text",
    type: "imageAndText",
    className: "min-h-[200px] p-8 mx-auto flex justify-center items-center",
    content: {
      id: uuidv4(),
      type: "column" as ContentType,
      name: "Column",
      content: [
        {
          id: uuidv4(),
          type: "resizable-column" as ContentType,
          name: "Image and text",
          className: "border",
          content: [
            {
              id: uuidv4(),
              type: "column" as ContentType,
              name: "Column",
              content: [
                {
                  id: uuidv4(),
                  type: "image" as ContentType,
                  name: "Image",
                  className: "p-3",
                  content:
                    "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                  alt: "Title",
                },
              ],
            },
            {
              id: uuidv4(),
              type: "column" as ContentType,
              name: "Column",
              content: [
                {
                  id: uuidv4(),
                  type: "heading1" as ContentType,
                  name: "Heading1",
                  content: "",
                  placeholder: "Heading1",
                },
                {
                  id: uuidv4(),
                  type: "paragraph" as ContentType,
                  name: "Paragraph",
                  content: "",
                  placeholder: "start typing here",
                },
              ],
              className: "w-full h-full p-8 flex justify-center items-center",
              placeholder: "Heading1",
            },
          ],
        },
      ],
    },
  },

  {
    id: uuidv4(),
    slideName: "Text and image",
    type: "textAndImage",
    className: "min-h-[200px] p-8 mx-auto flex justify-center items-center",
    content: {
      id: uuidv4(),
      type: "column" as ContentType,
      name: "Column",
      content: [
        {
          id: uuidv4(),
          type: "resizable-column" as ContentType,
          name: "Text and image",
          className: "border",
          content: [
            {
              id: uuidv4(),
              type: "column" as ContentType,
              name: "",
              content: [
                {
                  id: uuidv4(),
                  type: "heading1" as ContentType,
                  name: "Heading1",
                  content: "",
                  placeholder: "Heading1",
                },
                {
                  id: uuidv4(),
                  type: "paragraph" as ContentType,
                  name: "Paragraph",
                  content: "",
                  placeholder: "start typing here",
                },
              ],
              className: "w-full h-full p-8 flex justify-center items-center",
              placeholder: "Heading1",
            },
            {
              id: uuidv4(),
              type: "column" as ContentType,
              name: "Column",
              content: [
                {
                  id: uuidv4(),
                  type: "image" as ContentType,
                  name: "Image",
                  className: "p-3",
                  content:
                    "https://plus.unsplash.com/premium_photo-1729004379397-ece899804701?q=80&w=2767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                  alt: "Title",
                },
              ],
            },
          ],
        },
      ],
    },
  },

  {
    id: uuidv4(),
    slideName: "Two columns",
    type: "twoColumns",
    className: "p-4 mx-auto flex justify-center items-center",
    content: {
      id: uuidv4(),
      type: "column" as ContentType,
      name: "Column",
      content: [
        {
          id: uuidv4(),
          type: "title" as ContentType,
          name: "Title",
          content: "",
          placeholder: "Untitled Card",
        },
        {
          id: uuidv4(),
          type: "resizable-column" as ContentType,
          name: "Text and image",
          className: "border",
          content: [
            {
              id: uuidv4(),
              type: "paragraph" as ContentType,
              name: "Paragraph",
              content: "",
              placeholder: "Start typing...",
            },
            {
              id: uuidv4(),
              type: "paragraph" as ContentType,
              name: "Paragraph",
              content: "",
              placeholder: "Start typing...",
            },
          ],
        },
      ],
    },
  },

  {
    id: uuidv4(),
    slideName: "Two columns with headings",
    type: "twoColumnsWithHeadings",
    className: "p-4 mx-auto flex justify-center items-center",
    content: {
      id: uuidv4(),
      type: "column" as ContentType,
      name: "Column",
      content: [
        {
          id: uuidv4(),
          type: "title" as ContentType,
          name: "Title",
          content: "",
          placeholder: "Untitled Card",
        },
        {
          id: uuidv4(),
          type: "resizable-column" as ContentType,
          name: "Text and image",
          className: "border",
          content: [
            {
              id: uuidv4(),
              type: "column" as ContentType,
              name: "Column",
              content: [
                {
                  id: uuidv4(),
                  type: "heading3" as ContentType,
                  name: "Heading3",
                  content: "",
                  placeholder: "Heading 3",
                },
                {
                  id: uuidv4(),
                  type: "paragraph" as ContentType,
                  name: "Paragraph",
                  content: "",
                  placeholder: "Start typing...",
                },
              ],
            },
            {
              id: uuidv4(),
              type: "column" as ContentType,
              name: "Column",
              content: [
                {
                  id: uuidv4(),
                  type: "heading3" as ContentType,
                  name: "Heading3",
                  content: "",
                  placeholder: "Heading 3",
                },
                {
                  id: uuidv4(),
                  type: "paragraph" as ContentType,
                  name: "Paragraph",
                  content: "",
                  placeholder: "Start typing...",
                },
              ],
            },
          ],
        },
      ],
    },
  },

  {
    id: uuidv4(),
    slideName: "Three column",
    type: "threeColumns",
    className: "p-4 mx-auto flex justify-center items-center",
    content: {
      id: uuidv4(),
      type: "column" as ContentType,
      name: "Column",
      content: [
        {
          id: uuidv4(),
          type: "title" as ContentType,
          name: "Title",
          content: "",
          placeholder: "Untitled Card",
        },
        {
          id: uuidv4(),
          type: "resizable-column" as ContentType,
          name: "Text and image",
          className: "border",
          content: [
            {
              id: uuidv4(),
              type: "paragraph" as ContentType,
              name: "",
              content: "",
              placeholder: "Start typing...",
            },
            {
              id: uuidv4(),
              type: "paragraph" as ContentType,
              name: "",
              content: "",
              placeholder: "Start typing...",
            },
            {
              id: uuidv4(),
              type: "paragraph" as ContentType,
              name: "",
              content: "",
              placeholder: "Start typing...",
            },
          ],
        },
      ],
    },
  },
];

const generateImageUrl = async (prompt: string): Promise<string> => {
  const size = "1024x1024";
  try {
    const improvedPrompt = `
    Create a highly realistic, professional image based on the following description. The image should look as if captured in real life, with attention to detail, lighting, and texture. The image should be ${size}.

Description: ${prompt}

Important Notes:

-The image must be in a photorealistic style and visually compelling.

- Ensure all text, signs, or visible writing in the image are in English.

-Pay special attention to lighting, shadows, and textures to make the image as lifelike as possible.

-Avoid elements that appear abstract, cartoonish, or overly artistic. The image should be suitable for professional presentations.

- Focus on accurately depicting the concept described, including specific objects, environment, mood, and context. Maintain relevance to the description provided.

Example Use Cases: Business presentations, educational slides, professional designs.
    `;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp-image-generation",
    });

    const dalleResponse = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: improvedPrompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "image/jpeg",
        temperature: 1,
        topK: 40,
        topP: 0.95,
      },
    });
    const imagePart =
      dalleResponse.response.candidates?.[0]?.content?.parts?.[0];

    if (imagePart?.inlineData?.data) {
      const base64 = imagePart.inlineData.data;
      const mimeType = imagePart.inlineData.mimeType || "image/jpeg";
      return `data:${mimeType};base64,${base64}`;
    }
  } catch (error) {
    console.error("Failed to generate image:", error);
  }
};

const findImageComponents = (layout: ContentItem): ContentItem[] => {
  const images = [];
  if (layout.type === "image") {
    images.push(layout);
  }

  if (Array.isArray(layout.content)) {
    layout.content.forEach((child) => {
      images.push(...findImageComponents(child as ContentItem));
    });
  } else if (layout.content && typeof layout.content === "object") {
    images.push(...findImageComponents(layout.content));
  }

  return images;
};

const replaceImagePlaceholders = async (layout: Slide) => {
  const imageComponents = findImageComponents(layout.content);
  console.log("🟢Found image components:", imageComponents);
  for (const component of imageComponents) {
    console.log("🟢Generating image for component:", component.alt);
    component.content = await generateImageUrl(
      component.alt || "Placeholder Image"
    );
  }
};

export const generateLayoutsJson = async (outlineArray: string[]) => {
  const prompt = `You are a highly creative AI that generates JSON-based layouts for presentations. I will provide you with an array of outlines, and for each outline, you must generate a unique and creative layout. Use the existing layouts as examples for structure and design, and generate unique designs based on the provided outline.

### Guidelines:

1. Write layouts based on the specific outline provided.

2. Use diverse and engaging designs, ensuring each layout is unique.

3. Adhere to the structure of existing layouts but add new styles or components if needed.

4. Fill placeholder data into content fields where required.

5. Generate unique image placeholders for the 'content' property of image components and also alt text according to the outline.

6. Ensure proper formatting and schema alignment for the output JSON.

### Example Layouts:

${JSON.stringify(existingLayouts, null, 2)}

### Outline Array:

${JSON.stringify(outlineArray)}

For each entry in the outline array, generate:

- A unique JSON layout with creative designs.

-Properly filled content, including placeholders for image components.

-Clear and well-structured JSON data.

For Images

-The alt text should describe the image clearly and concisely.
- Focus on the main subject(s) of the image and any relevant details such as colors, shapes, people, or objects.

- Ensure the alt text aligns with the context of the presentation slide it will be used on (e.g., professional, educational, business-related).

- Avoid using terms like "image of" or "picture of," and instead focus directly on the content and meaning.

Output the layouts in JSON format. Ensure there are no duplicate layouts across the array.
`;

  try {
    console.log("Generating layout...");
    const result = await generateText({
      model: googleAI("models/gemini-1.5-flash"),
      messages: [
        {
          role: "system",
          content: "You generate JSON layouts for presentations.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.7,
      maxTokens: 5000,
    });

    

    const rawOutput = result.text.trim();
    console.log("✅ Parsed layouts:", rawOutput);

    // Sanitize and extract valid JSON from possible markdown wrappers
    const cleanedOutput = rawOutput
      .replace(/```json|```/g, "")
      .replace(/^\s+|\s+$/g, "") // Remove markdown code fences
      .trim();


    console.log("Cleaned output:", cleanedOutput);

    if (!cleanedOutput) {
      throw new Error("No output received or output is empty.");
    }

    // Check if the output starts with either an array or an object
    if (cleanedOutput.startsWith('[') && cleanedOutput.endsWith(']')) {
      // It's an array, parse it
      try {
        const layouts = JSON.parse(cleanedOutput);
        console.log("Parsed layouts (Array):", layouts);
        return { status: 200, data: layouts };
      } catch (error) {
        console.error("Error parsing array JSON:", error);
        throw new Error("Invalid JSON array format received.");
      }
    } else if (cleanedOutput.startsWith('{') && cleanedOutput.endsWith('}')) {
      // It's an object, parse it
      try {
        const layouts = JSON.parse(cleanedOutput);
        console.log("Parsed layouts (Object):", layouts);
        return { status: 200, data: layouts };
      } catch (error) {
        console.error("Error parsing object JSON:", error);
        throw new Error("Invalid JSON object format received.");
      }
    } else {
      throw new Error("Invalid JSON format: neither object nor array.");
    }
  
  


    // Fallback: extract JSON body just in case extra stuff is still there
    const jsonMatch = cleanedOutput.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(
        "No valid JSON found in the response. So no content generated"
      );
    }

    //const jsonResponse = JSON.parse(jsonMatch[0]);
    const layouts = JSON.parse(jsonMatch[0]);

    // Replace images
    for (const layout of layouts) {
      await replaceImagePlaceholders(layout);
    }

    

    console.log("Layout generated successfully");
    return { status: 200, data: layouts };
  } catch (error) {
    console.log("🔴 ERROR", error);
    return { status: 500, error: "Internal server error" };
  }
};

export const generateLayouts = async (projectId: string, theme: string) => {
  try {
    if (!projectId) {
      return { status: 400, error: "Project ID is required" };
    }

    const user = await currentUser();
    if (!user) {
      return { status: 403, error: "User not authenticated" };
    }

    const userExist = await client.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!userExist || !userExist.subscription) {
      return {
        status: 403,
        error: !userExist?.subscription
          ? "User does not have an active subscription"
          : "User not found in the database",
      };
    }

    const project = await client.project.findUnique({
      where: {
        id: projectId,
        isDeleted: false,
      },
    });

    if (!project) {
      return { status: 404, error: "Project not found" };
    }

    if (!project.outlines || project.outlines.length === 0) {
      return { status: 400, error: "Project does not have any outlines" };
    }

    const layouts = await generateLayoutsJson(project.outlines);

    if (layouts.status !== 200) {
      return layouts;
    }
    await client.project.update({
      where: { id: projectId },
      data: { slides: layouts.data, themeName: theme },
    });
    return { status: 200, data: layouts.data };
  } catch (error) {
    console.error("🔴 ERROR", error);
    return { status: 500, error: "Internal server error", data: [] };
  }
};
