import { Schema, model } from 'mongoose'
import validator from 'validator'

const schema = new Schema(
  {
    title: {
      type: String,
      required: [true, '文章標題是必填的'],
      trim: true,
      maxlength: [100, '文章標題最多只能有 100 個字元'],
    },
    description: {
      type: String,
      required: [true, '文章描述是必填的'],
      trim: true,
      maxlength: [500, '文章描述最多只能有 500 個字元'],
    },
    author: {
      type: String,
      required: [true, '作者是必填的'],
      trim: true,
      maxlength: [50, '作者名稱最多只能有 50 個字元'],
      default: 'MuscleMap 編輯部',
    },
    image: {
      type: String,
      validate: {
        validator(value) {
          return !value || validator.isURL(value)
        },
        message: '圖片必須是有效的 URL',
      },
    },
    link: {
      type: String,
      validate: {
        validator(value) {
          return !value || validator.isURL(value)
        },
        message: '連結必須是有效的 URL',
      },
    },
    buttonText: {
      type: String,
      trim: true,
      maxlength: [20, '按鈕文字最多只能有 20 個字元'],
      default: '閱讀更多',
    },
    isFeatured: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// 建立索引
schema.index({ isFeatured: 1, isActive: 1, order: 1, publishDate: -1 })

export default model('articles', schema)
