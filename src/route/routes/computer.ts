import express from "express";
import { create, readOne, readAll, update, remove, read } from "../../controller/computer"

const router = express.Router()

router.post('/create', create);

router.get('/:id', readOne);

router.get('/', readAll);

router.post('/filter', read);

router.post('/:id/update', update);

router.get('/:id/remove', remove);

export default router;
