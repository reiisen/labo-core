import express from "express";
import { create, readOne, readAll, update, remove } from "../../controller/lab"

const router = express.Router()

router.post('/create', create);

router.get('/:id', readOne);

router.get('/', readAll);

router.get('/:id/update', update);

router.get('/:id/remove', remove);

export default router;
