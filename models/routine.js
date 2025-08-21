import { Schema, model } from 'mongoose'

const workoutSchema = new Schema({
  exercise: {
    type: Schema.Types.ObjectId,
    ref: 'exercises',
    required: [true, '動作 ID 是必填的'],
  },
  sets: {
    type: Number,
    required: [true, '組數是必填的'],
    min: [1, '組數至少需要 1'],
  },
  reps: {
    type: Number,
    required: [true, '次數是必填的'],
    min: [1, '次數至少需要 1'],
  },
  rest: {
    type: Number,
    required: [true, '休息時間是必填的'],
    min: [0, '休息時間不能為負數'],
  },
})

const dayWorkoutSchema = new Schema({
  day: {
    type: String,
    required: [true, '星期是必填的'],
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  },
  name: {
    type: String,
    required: [true, '訓練名稱是必填的'],
    maxlength: [100, '訓練名稱最多只能有 100 個字元'],
  },
  workouts: {
    type: [workoutSchema],
    default: [],
  },
  notes: {
    type: String,
    maxlength: [200, '備註最多只能有 200 個字元'],
    default: '',
  },
  isRestDay: {
    type: Boolean,
    default: false,
  },
})

const schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: [true, '使用者 ID 是必填的'],
    },
    title: {
      type: String,
      required: [true, '課表名稱是必填的'],
      minlength: [1, '課表名稱至少需要 1 個字元'],
      maxlength: [50, '課表名稱最多只能有 50 個字元'],
    },
    content: {
      type: String,
      required: [true, '課表內容是必填的'],
      minlength: [1, '課表內容至少需要 1 個字元'],
      maxlength: [500, '課表內容最多只能有 500 個字元'],
    },
    weeklyPlan: {
      type: [dayWorkoutSchema],
      required: [true, '週計劃是必填的'],
      validate: {
        validator: function (weeklyPlan) {
          // 確保包含一週七天
          const days = [
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday',
          ]
          const planDays = weeklyPlan.map((plan) => plan.day)
          return days.every((day) => planDays.includes(day))
        },
        message: '週計劃必須包含一週七天',
      },
    },
    // 保留舊的 workouts 欄位用於向後相容，但不再必填
    workouts: {
      type: [workoutSchema],
      default: [],
    },
    isPublic: {
      type: Boolean,
      default: false,
      required: [true, '是否公開是必填的'],
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'users',
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
)

export default model('routines', schema)
