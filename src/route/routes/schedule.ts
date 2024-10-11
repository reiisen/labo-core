import express from "express";
import { create, read, readAll, readOne } from "../../controller/schedule"

const router = express.Router()

router.post('/create', create);

router.get('/', readAll);

router.get('/filter', read)

router.get('/:id/update',);

router.get('/:id/remove',);

router.get('/:id', readOne);

export default router;
