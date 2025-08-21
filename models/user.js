import { Schema, Error, model } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'

const favoriteSchema = new Schema(
  {
    routines: {
      type: Schema.Types.ObjectId,
      ref: 'routines',
      required: [true, '課表 ID 是必填的'],
    },
  },
  { versionKey: false },
)

const schema = new Schema(
  {
    account: {
      type: String,
      required: [true, '帳號是必填的'],
      minlength: [4, '帳號至少需要 4 個字元'],
      maxlength: [20, '帳號最多只能有 20 個字元'],
      unique: true,
      trim: true,
      validate: {
        validator(value) {
          return validator.isAlphanumeric(value)
        },
        message: '帳號只能包含英文字母和數字',
      },
    },
    username: {
      type: String,
      required: [true, '使用者名稱是必填的'],
      minlength: [2, '使用者名稱至少需要 2 個字元'],
      maxlength: [30, '使用者名稱最多只能有 30 個字元'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, '電子郵件是必填的'],
      unique: true,
      trim: true,
      validate: {
        validator(value) {
          return validator.isEmail(value)
        },
        message: '請輸入有效的電子郵件地址',
      },
    },
    password: {
      type: String,
      required: [true, '密碼是必填的'],
    },
    favorites: {
      type: [favoriteSchema],
      default: [],
    },
    tokens: {
      type: [String],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: [true, '性別是必填的'],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
)

// 在保存前對密碼進行處理
// 盡量用 function 不要用箭頭
// next = 讓 mongoose 繼續下一步處理
// https://mongoosejs.com/docs/middleware.html#middleware
schema.pre('save', function (next) {
  // this = 現在要保存的資料
  const user = this
  // 如果密碼欄位有修改，進行加密
  if (user.isModified('password')) {
    // 驗證密碼明文格式
    if (user.password.length < 4 || user.password.length > 20) {
      // 如果密碼長度不符合要求，拋出 mongoose 的驗證錯誤
      // 用跟 mongoose 的 schema 驗證錯誤一樣的錯誤格式
      // 可以跟其他驗證錯誤一起處理
      const error = new Error.ValidationError()
      // 設定密碼欄位錯誤
      error.addError(
        'password',
        new Error.ValidatorError({ message: '密碼長度必須在 4 到 20 個字元之間' }),
      )
      // 繼續處理，把錯誤傳出去
      // mongoose 遇到錯誤就不會存資料庫
      next(error)
      return
    } else {
      // 密碼格式符合要求，使用 bcrypt 加密密碼
      user.password = bcrypt.hashSync(user.password, 10)
    }
  }
  // 限制有效 token 數量
  if (user.isModified('tokens') && user.tokens.length > 3) {
    user.tokens.shift()
  }
  // 繼續處理
  next()
})

// 虛擬的動態欄位
// 盡量用 function 不要用箭頭
// .get() 欄位資料的產生方式
// schema.virtual('cartTotal').get(function () {
//   this = 現在要保存的資料
//   const user = this
//   return user.cart.reduce((total, item) => {
//     return total + item.quantity
//   }, 0)
// })

// 驗證密碼的方法
schema.methods.isValidPassword = function (password) {
  return bcrypt.compareSync(password, this.password)
}

export default model('users', schema)
