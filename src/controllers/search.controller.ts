import { Request, Response } from 'express';
import { Search } from '../models/search.model';

export const searchHandler = async (req: Request, res: Response) => {
  const query = req.body.query as string;
  const file = req.file;

  if (!file) return res.status(400).json({ message: 'Image file is required' });
  if (!query) return res.status(400).json({ message: 'Missing query' });
  const results = `Result for: ${query}`; 

  const searchRecord = await Search.create({
    query,
    result : results,
    images: [`/uploads/${file.filename}`],
  });

  res.status(201).json({
    message: 'Search saved successfully',
    data: searchRecord,
  });
};
