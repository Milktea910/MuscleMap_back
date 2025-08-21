import { Schema, model } from 'mongoose'

const schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: [true, '使用者 ID 是必填的'],
    },
    weight: {
      type: Number,
      required: [true, '體重欄位是必填的'],
      min: [0, '體重不能為負數'],
      max: [500, '體重異常過高'],
    },
    muscleMass: {
      type: Number,
      required: [true, '肌肉欄位是必填的'],
      min: [0, '肌肉不能為負數'],
      max: [300, '肌肉量異常過高'],
    },
    fat: {
      type: Number,
      required: [true, '脂肪欄位是必填的'],
      min: [0, '脂肪不能為負數'],
      max: [200, '脂肪量異常過高'],
    },
    bmi: {
      type: Number,
      min: [0, 'bmi不能為負數'],
      max: [60, 'bmi異常過高'],
    },
    recordDate: {
      type: Date,
      required: [true, '記錄日期是必填的'],
      default: Date.now,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
)

export default model('inbodys', schema)
