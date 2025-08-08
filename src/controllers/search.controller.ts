import { Request, Response } from 'express';
import OpenAI from 'openai';
import path from 'path';
import { Search } from '../models/search.model';
import fs from 'fs';

export const searchHandler = async (req: Request, res: Response) => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY as string,
    });
    const prompt = req.body.prompt as string;
    const file = req.file;
    const image = file ? file.filename : undefined;
  
    if (!prompt && !image) {
      return res.status(400).json({ error: 'Please provide a prompt or at least one image' });
    }
    let resultText = '';
    const imageUrl = image ? `${process.env.BASE_URL}/uploads/${image}` : undefined;
    let usedModel = '';
    let resultImagePath: string | undefined;

    const results = `Result for: ${prompt}`; 
    let completion;
    if (image && prompt) {
      // Prompt + Image
      usedModel = 'gpt-4o';
      completion = await openai.chat.completions.create({
        model: usedModel,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl! } }
            ],
          },
        ],
      });
    } else if (image && !prompt) {
      // Image only
      usedModel = 'gpt-4o';
      completion = await openai.chat.completions.create({
        model: usedModel,
        messages: [
          {
            role: 'user',
            content: [{ type: 'image_url', image_url: { url: imageUrl! } }],
          },
        ],
      });
    } else {
      // Prompt only
      usedModel = 'gpt-4o-mini';
      completion = await openai.chat.completions.create({
        model: usedModel,
        messages: [{ role: 'user', content: prompt }],
      });
    }
  
    if ((completion as any).data && (completion as any).data[0]?.b64_json) {
      // Save base64 image
      const b64 = (completion as any).data[0].b64_json;
      const fileName = `gpt_${Date.now()}.png`;
      const savePath = path.join(__dirname, '../../uploads', fileName);
      fs.writeFileSync(savePath, Buffer.from(b64, 'base64'));
      resultImagePath = fileName;
    } else if ((completion as any).data && (completion as any).data[0]?.url) {
      // If GPT returned an image URL (we store the URL directly)
      resultImagePath = (completion as any).data[0].url;
    }
  
    resultText = completion.choices[0]?.message?.content || '';
    const searchRecord = await Search.create({
      prompt,
      result : resultText,
      images: [`/uploads/${image}`],
      resImages : [resultImagePath]
    });
    res.status(201).json({
      message: 'Search saved successfully',
      data: searchRecord,
    });
  } catch (error) {
    console.log('Error ...', error);
    res.status(422).json({
      error: error,
    });
  }
};
