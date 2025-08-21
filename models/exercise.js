import { Schema, model } from 'mongoose'

const schema = new Schema(
  {
    name: {
      type: String,
      required: [true, '動作名稱是必填的'],
    },
    equipment: {
      type: String,
      enum: {
        values: [
          '啞鈴',
          '器械',
          '壺鈴',
          '繩索',
          '槓片',
          '史密斯',
          '槓鈴',
          '徒手',
          '藥球',
          '伸展',
          '彈力繩',
          '有氧',
        ],
        message: '請選擇有效的分類',
      },
      required: [true, '器材是必須的'],
    },
    difficulty: {
      type: String,
      enum: ['簡單', '普通', '困難'],
      required: [true, '難度是必須的'],
    },
    targetMuscle: {
      type: [String],
      enum: [
        '胸大肌',
        '上胸肌',
        '斜方肌',
        '背闊肌',
        '菱形肌',
        '豎脊肌',
        '肩前束',
        '肩中束',
        '肩後束',
        '肱二頭肌',
        '肱三頭肌',
        '前臂',
        '腹直肌',
        '腹內外斜肌',
        '豎脊肌',
        '股四頭肌',
        '大腿後側肌群',
        '臀大肌',
        '小腿肌群',
        '手',
      ],
      validate: {
        validator: function (arr) {
          return arr.length >= 1
        },
        message: '至少需要選擇一個目標肌群',
      },
      required: [true, '目標肌肉是必須的'],
    },
    video: {
      type: String,
      required: [true, '影片是必須的'],
    },
    notes: {
      type: [String],
      validate: {
        validator: function (arr) {
          return arr.length >= 3
        },
        message: '至少需要提供三點注意事項',
      },
      required: [true, '注意事項是必須的'],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
)

export default model('exercises', schema)
