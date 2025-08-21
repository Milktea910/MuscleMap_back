import User from '../models/user.js'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import validator from 'validator'
import Routine from '../models/routine.js'

export const create = async (req, res) => {
  try {
    await User.create({
      account: req.body.account,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      gender: req.body.gender,
    })
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: '',
    })
  } catch (error) {
    console.log('controllers/user.js create')
    console.error(error)
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.errors[key].message,
      })
    } else if (error.name === 'MongoServerError' && error.code === 11000) {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: '使用者已存在',
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '伺服器內部錯誤',
      })
    }
  }
}

export const login = async (req, res) => {
  try {
    // https://github.com/auth0/node-jsonwebtoken?tab=readme-ov-file#jwtsignpayload-secretorprivatekey-options-callback
    const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7 days' })
    req.user.tokens.push(token)
    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '登入成功',
      user: {
        _id: req.user._id,
        account: req.user.account,
        username: req.user.username,
        role: req.user.role,
        gender: req.user.gender,
        cartTotal: req.user.cartTotal,
        token,
      },
    })
  } catch (error) {
    console.log('controllers/user.js login')
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '伺服器內部錯誤',
    })
  }
}

export const profile = (req, res) => {
  res.status(StatusCodes.OK).json({
    success: true,
    user: {
      _id: req.user._id,
      account: req.user.account,
      username: req.user.username,
      role: req.user.role,
      gender: req.user.gender,
      email: req.user.email,
      createdAt: req.user.createdAt,
    },
  })
}

export const refresh = async (req, res) => {
  try {
    const i = req.user.tokens.indexOf(req.token)
    const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7 days' })
    req.user.tokens[i] = token
    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      token,
    })
  } catch (error) {
    console.log('controllers/user.js refresh')
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '伺服器內部錯誤',
    })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const { username, gender, currentPassword, newPassword } = req.body

    // 如果要更改密碼，需要驗證當前密碼
    if (newPassword) {
      if (!currentPassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: '請輸入當前密碼',
        })
      }

      // 驗證當前密碼
      const isCurrentPasswordValid = await req.user.isValidPassword(currentPassword)
      if (!isCurrentPasswordValid) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: '當前密碼錯誤',
        })
      }

      // 設定新密碼
      req.user.password = newPassword
    }

    // 更新其他欄位 (帳號不能修改)
    if (username) req.user.username = username
    if (gender) req.user.gender = gender

    await req.user.save()

    res.status(StatusCodes.OK).json({
      success: true,
      message: '個人資料更新成功',
      user: {
        _id: req.user._id,
        account: req.user.account,
        username: req.user.username,
        email: req.user.email,
        gender: req.user.gender,
        role: req.user.role,
        createdAt: req.user.createdAt,
      },
    })
  } catch (error) {
    console.error('updateProfile error:', error)

    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.errors[key].message,
      })
    } else if (error.name === 'MongoServerError' && error.code === 11000) {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: '帳號已被使用',
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '伺服器內部錯誤',
      })
    }
  }
}

export const logout = async (req, res) => {
  try {
    // 從 tokens 中移除當前的 token
    req.user.tokens = req.user.tokens.filter((token) => token !== req.token)
    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
    })
  } catch (error) {
    console.log('controllers/user.js logout')
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '伺服器內部錯誤',
    })
  }
}

export const favorite = async (req, res) => {
  try {
    // 驗證請求的商品 ID
    if (!validator.isMongoId(req.body.routine)) {
      throw new Error('ROUTINE ID')
    }
    // 檢查商品是否存在
    await Routine.findOne({ _id: req.body.routine }).orFail(new Error('ROUTINE NOT FOUND'))

    // 檢查購物車中是否已經有該商品
    // 購物車內的 product 資料型態是 ObjectId，使用 .toString() 轉換為字串進行比較
    const i = req.user.favorites.findIndex((item) => item.routines.toString() === req.body.routine)
    // 如果購物車中已經有該商品，則增加數量
    if (i > -1) {
      throw new Error('ROUTINE ALREADY HAVE')
    }
    // 如果購物車中沒有該商品，且數量 > 0，則新增商品到購物車
    else {
      req.user.favorites.push({
        routines: req.body.routine,
      })
    }
    // 保存
    await req.user.save()

    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
    })
  } catch (error) {
    console.error(error)
    if (error.message === 'ROUTINE ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '課表 ID 格式錯誤',
      })
    } else if (error.message === 'ROUTINE NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '課表不存在',
      })
    } else if (error.message === 'ROUTINE ALREADY HAVE') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '該課表已加入過收藏',
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '伺服器內部錯誤',
      })
    }
  }
}

export const getFavorite = async (req, res) => {
  try {
    // email account        --> 只取 email 和 account 欄位
    // -password -email     --> 除了 password 和 email 以外的欄位
    const user = await User.findById(req.user._id, 'favorites')
      // .populate(ref欄位, 指定取的欄位)
      // 關聯 cart.product 的 ref 指定的 collection，只取 name 欄位
      // .populate('cart.product', 'name')
      .populate('favorites.routines', 'title content workouts')
      .orFail(new Error('USER NOT FOUND'))

    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: user.favorites,
    })
  } catch (error) {
    if (error.message === 'USER ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '使用者 ID 格式錯誤',
      })
    } else if (error.message === 'USER NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '使用者不存在',
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '伺服器內部錯誤',
      })
    }
  }
}
