import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { searchHandler } from '../controllers/search.controller';
import { upload } from '../utils/upload';

const router = Router();

router.post('/search', upload.single('image'), searchHandler);

export default router;
