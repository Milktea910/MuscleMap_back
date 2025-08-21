import { Router } from 'express'
import * as inbody from '../controllers/inbody.js'
import * as auth from '../middlewares/auth.js'

const router = Router()

router.post('/', auth.token, inbody.create)
router.get('/', auth.token, inbody.getAll)
router.get('/profile', auth.token, inbody.profile)
router.get('/:id', auth.token, inbody.getById)
router.put('/:id', auth.token, inbody.updateById)
router.delete('/:id', auth.token, inbody.deleteById)

export default router
