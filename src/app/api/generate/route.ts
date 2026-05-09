import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { repoData, tone, includeEmojis, specialInstructions } = await request.json();

    if (!repoData) {
      return NextResponse.json({ error: 'Repository data is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 });
    }

    const prompt = `You are an expert developer and technical writer. 
Write a comprehensive, highly-polished README.md file for the following GitHub repository.
The tone of the README must be: ${tone}.
${includeEmojis ? 'You MUST strictly sprinkle relevant emojis into the headers and bullet points.' : 'You MUST use ZERO emojis in the entire output.'}

Repository Name: ${repoData.name}
Description: ${repoData.description || 'Not provided'}
Primary Tech Stack: ${repoData.languages?.join(', ') || 'Not specified'}
File Structure:
${repoData.fileTree?.slice(0, 200).join('\n') || 'Not available'}

The README MUST include the following sections:
- Project Title
- Description
- Installation
- Usage
- Contributing

Only output the raw markdown. Do not include markdown code block backticks surrounding the entire output.${specialInstructions ? `\n\nSpecial instructions from the user (follow precisely): ${specialInstructions}` : ''}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', result);
      return NextResponse.json({ error: 'Failed to generate content with Gemini API' }, { status: response.status });
    }

    let generatedText = result.candidates[0].content.parts[0].text;

    // Remove wrapping markdown codeblocks if Gemini added them
    if (generatedText.startsWith('```markdown')) {
      generatedText = generatedText.substring(11);
      if (generatedText.endsWith('```')) {
        generatedText = generatedText.substring(0, generatedText.length - 3);
      }
    } else if (generatedText.startsWith('```')) {
      generatedText = generatedText.substring(3);
      if (generatedText.endsWith('```')) {
        generatedText = generatedText.substring(0, generatedText.length - 3);
      }
    }

    return NextResponse.json({ markdown: generatedText.trim() });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
