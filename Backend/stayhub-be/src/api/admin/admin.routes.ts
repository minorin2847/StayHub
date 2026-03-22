import { Router } from 'express';
import { requireRole } from '../auth/auth.handler.js';

const router = Router();

router.use(requireRole(['ADMINISTRATOR']));

router.get("/users", (req, res) => {
    res.send("Admin");
})

export default router;