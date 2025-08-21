import { Router } from 'express'
import * as routine from '../controllers/routine.js'
import * as auth from '../middlewares/auth.js'

const router = Router()

router.post('/', auth.token, routine.create)
router.get('/', auth.token, auth.admin, routine.getALl)
router.get('/public', auth.optionalToken, routine.getPublicRoutines)
router.get('/my', auth.token, routine.getMyRoutines)
router.get('/liked', auth.token, routine.getLikedRoutines)
router.delete('/:id', auth.token, routine.deleteRoutine)
router.patch('/:id', auth.token, routine.updateRoutine)
router.post('/:id/like', auth.token, routine.toggleLike)
router.patch('/:id/visibility', auth.token, routine.updateVisibility)

// 管理員專用路由
router.get('/admin/all', auth.token, auth.admin, routine.getALl)
router.delete('/admin/:id', auth.token, auth.admin, routine.adminDeleteRoutine)

export default router
