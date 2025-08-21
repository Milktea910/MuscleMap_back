import { Router } from 'express'
import * as auth from '../middlewares/auth.js'
import {
  getFeaturedArticles,
  getAllArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticleById,
} from '../controllers/article.js'

const router = Router()

// 獲取精選文章 (公開)
router.get('/featured', getFeaturedArticles)

// 獲取所有文章 (公開)
router.get('/', getAllArticles)

// 獲取單篇文章 (公開)
router.get('/:id', getArticleById)

// 創建文章 (需要管理員權限)
router.post('/', auth.token, auth.admin, createArticle)

// 更新文章 (需要管理員權限)
router.patch('/:id', auth.token, auth.admin, updateArticle)

// 刪除文章 (需要管理員權限)
router.delete('/:id', auth.token, auth.admin, deleteArticle)

export default router
