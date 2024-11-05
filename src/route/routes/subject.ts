import express from "express";
import { create, readOne, readAll, update, remove, read } from "../../controller/subject"

const router = express.Router()

router.post('/create', create);

router.get('/:id', readOne);

router.get('/', readAll);

router.get('/filter', read);

router.get('/:id/update', update);

router.get('/:id/remove', remove);

export default router;
