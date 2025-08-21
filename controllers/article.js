import Article from '../models/article.js'
import { StatusCodes } from 'http-status-codes'

// 獲取所有精選文章
export const getFeaturedArticles = async (req, res) => {
  try {
    const articles = await Article.find({ isFeatured: true, isActive: true })
      .sort({ order: 1, publishDate: -1 })
      .select('-__v')

    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      data: articles,
    })
  } catch (error) {
    console.error('獲取精選文章失敗:', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '獲取精選文章失敗',
    })
  }
}

// 獲取所有文章（包含非精選）
export const getAllArticles = async (req, res) => {
  try {
    const { page = 1, limit = 10, featured, active } = req.query
    const filter = {}

    if (featured !== undefined) {
      filter.isFeatured = featured === 'true'
    }
    if (active !== undefined) {
      filter.isActive = active === 'true'
    }

    const articles = await Article.find(filter)
      .sort({ order: 1, publishDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v')

    const total = await Article.countDocuments(filter)

    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      data: {
        articles,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
      },
    })
  } catch (error) {
    console.error('獲取文章失敗:', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '獲取文章失敗',
    })
  }
}

// 創建新文章
export const createArticle = async (req, res) => {
  try {
    const article = await Article.create({
      title: req.body.title,
      description: req.body.description,
      author: req.body.author,
      image: req.body.image,
      link: req.body.link,
      buttonText: req.body.buttonText,
      isFeatured: req.body.isFeatured,
      isActive: req.body.isActive,
      order: req.body.order,
    })

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: '文章建立成功',
      data: article,
    })
  } catch (error) {
    console.error('建立文章失敗:', error)
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.errors[key].message,
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '建立文章失敗',
      })
    }
  }
}

// 更新文章
export const updateArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        author: req.body.author,
        image: req.body.image,
        link: req.body.link,
        buttonText: req.body.buttonText,
        isFeatured: req.body.isFeatured,
        isActive: req.body.isActive,
        order: req.body.order,
      },
      { new: true, runValidators: true },
    )

    if (!article) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '找不到該文章',
      })
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: '文章更新成功',
      data: article,
    })
  } catch (error) {
    console.error('更新文章失敗:', error)
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.errors[key].message,
      })
    } else if (error.name === 'CastError') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '文章 ID 格式錯誤',
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '更新文章失敗',
      })
    }
  }
}

// 刪除文章
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id)

    if (!article) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '找不到該文章',
      })
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: '文章刪除成功',
    })
  } catch (error) {
    console.error('刪除文章失敗:', error)
    if (error.name === 'CastError') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '文章 ID 格式錯誤',
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '刪除文章失敗',
      })
    }
  }
}

// 獲取單篇文章
export const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).select('-__v')

    if (!article) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '找不到該文章',
      })
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      data: article,
    })
  } catch (error) {
    console.error('獲取文章失敗:', error)
    if (error.name === 'CastError') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '文章 ID 格式錯誤',
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '獲取文章失敗',
      })
    }
  }
}
