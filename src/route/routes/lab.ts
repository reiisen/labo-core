import express from "express";
import { create, readOne, readAll, update, toggleInactive, remove, read } from "../../controller/lab"

const router = express.Router()

router.post('/create', create);

router.get('/:id', readOne);

router.get('/', readAll);

router.post('/filter', read);

router.post('/:id/update', update);

router.post('/:id/toggle', toggleInactive);

router.get('/:id/remove', remove);

export default router;
