import express from "express";
import { create } from "../../controller/schedule"

const router = express.Router()

router.post('/create', create);

router.get('/id/:id',);

router.get('/',);

router.get('/:id/update',);

router.get('/:id/remove',);

export default router;
