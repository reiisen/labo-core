import express from "express";
import { create, readOne, readAll, update, remove, read, toggleInactive } from "../../controller/computer"

const router = express.Router()

router.post('/create', create);

router.get('/:id', readOne);

router.get('/', readAll);

router.post('/filter', read);

router.post('/:id/toggle', toggleInactive);

router.post('/:id/update', update);

router.get('/:id/remove', remove);

export default router;
