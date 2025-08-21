import { Router } from 'express'
import * as exercise from '../controllers/exercise.js'
import * as auth from '../middlewares/auth.js'
import upload from '../middlewares/upload.js'

const router = Router()

router.post('/', auth.token, auth.admin, upload, exercise.create)
router.patch('/:id', auth.token, auth.admin, upload, exercise.update)
router.get('/', exercise.getAll)
router.get('/:id', exercise.getById)
router.delete('/:id', auth.token, auth.admin, exercise.deleteById)

export default router
