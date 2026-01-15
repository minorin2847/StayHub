import express from 'express'
import { listName, addName } from './hello.handler.js'
const router = express.Router();

// GET /hello
router.get('/', listName);

// POST /hello
router.post("/", addName);

export default router;