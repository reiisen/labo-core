import express from "express";
import { create, read, readAll, readOne, update, remove, cancel, getActiveJobs, recheckAndRevive } from "../../controller/reserve"

const router = express.Router()

router.post('/create', create);

router.get('/', readAll);

router.post('/filter', read);

router.get('/jobs', getActiveJobs);

router.get('/revive', recheckAndRevive);

router.post('/:id/update', update);

router.get('/:id/cancel', cancel);

router.get('/:id/remove', remove);

router.get('/:id', readOne);

export default router;
