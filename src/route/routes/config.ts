import express from "express";
import { update, read, getVite } from "../../controller/config"

const router = express.Router()

router.post('/update', update);

router.get('/get', read);

router.get('/vite', getVite)

export default router;
