import express from "express";
import { update, read } from "../../controller/config"

const router = express.Router()

router.post('/update', update);

router.get('/get', read);

export default router;
