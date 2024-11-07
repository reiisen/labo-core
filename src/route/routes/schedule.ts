import express from "express";
import { create, read, readAll, readOne, update, remove } from "../../controller/course"

const router = express.Router()

router.post('/create', create);

router.get('/', readAll);

router.post('/filter', read)

router.get('/:id/update', update);

router.get('/:id/remove', remove);

router.get('/:id', readOne);

export default router;
