import Routine from '../models/routine.js'
import Exercise from '../models/exercise.js'
import { StatusCodes } from 'http-status-codes'

export const create = async (req, res) => {
  try {
    if (!req.body.title || !req.body.content) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '請提供完整課表資訊',
      })
    }

    // 處理週計劃
    let weeklyPlan = []
    if (req.body.weeklyPlan && Array.isArray(req.body.weeklyPlan)) {
      weeklyPlan = await Promise.all(
        req.body.weeklyPlan.map(async (dayPlan) => {
          if (!dayPlan.day || !dayPlan.name) {
            throw new Error('每日計劃必須包含星期和訓練名稱')
          }

          const workoutsWithId = await Promise.all(
            (dayPlan.workouts || []).map(async (w) => {
              let exerciseId = w.exercise

              if (typeof w.exercise === 'string' && w.exercise.length !== 24) {
                const exercise = await Exercise.findOne({ name: w.exercise })
                if (!exercise) {
                  throw new Error(`找不到動作名稱：${w.exercise}`)
                }
                exerciseId = exercise._id
              } else {
                const exercise = await Exercise.findById(exerciseId)
                if (!exercise) {
                  throw new Error(`找不到動作 ID：${exerciseId}`)
                }
              }

              return {
                exercise: exerciseId,
                sets: w.sets,
                reps: w.reps,
                rest: w.rest,
              }
            }),
          )

          return {
            day: dayPlan.day,
            name: dayPlan.name,
            workouts: workoutsWithId,
            notes: dayPlan.notes || '',
            isRestDay: dayPlan.isRestDay || false,
          }
        }),
      )
    } else {
      // 如果沒有提供週計劃，創建默認的一週計劃
      const days = [
        { day: 'monday', name: '週一訓練' },
        { day: 'tuesday', name: '週二訓練' },
        { day: 'wednesday', name: '週三訓練' },
        { day: 'thursday', name: '週四訓練' },
        { day: 'friday', name: '週五訓練' },
        { day: 'saturday', name: '週六訓練' },
        { day: 'sunday', name: '週日休息' },
      ]
      weeklyPlan = days.map((day) => ({
        ...day,
        workouts: [],
        notes: '',
        isRestDay: day.day === 'sunday',
      }))
    }

    // 處理舊版本的 workouts（向後相容）
    let legacyWorkouts = []
    if (req.body.workouts && Array.isArray(req.body.workouts)) {
      legacyWorkouts = await Promise.all(
        req.body.workouts.map(async (w) => {
          let exerciseId = w.exercise

          if (typeof w.exercise === 'string' && w.exercise.length !== 24) {
            const exercise = await Exercise.findOne({ name: w.exercise })
            if (!exercise) {
              throw new Error(`找不到動作名稱：${w.exercise}`)
            }
            exerciseId = exercise._id
          } else {
            const exercise = await Exercise.findById(exerciseId)
            if (!exercise) {
              throw new Error(`找不到動作 ID：${exerciseId}`)
            }
          }

          return {
            exercise: exerciseId,
            sets: w.sets,
            reps: w.reps,
            rest: w.rest,
          }
        }),
      )
    }

    const newRoutine = await Routine.create({
      user: req.user._id,
      title: req.body.title,
      content: req.body.content,
      weeklyPlan: weeklyPlan,
      workouts: legacyWorkouts,
      isPublic: req.body.isPublic || false,
    })

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: '課表新增成功',
      data: newRoutine,
    })
  } catch (error) {
    console.log('controllers/routine.js create')
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || '伺服器內部錯誤',
    })
  }
}
export const getALl = async (req, res) => {
  try {
    // 如果是管理員呼叫 /admin/all 路由，返回所有課表
    // 如果是一般用戶呼叫，只返回自己的課表
    let query = {}

    // 檢查路由路徑是否包含 admin
    if (req.route.path === '/admin/all') {
      // 管理員獲取所有課表
      query = {}
    } else {
      // 一般用戶只獲取自己的課表
      query = { user: req.user._id }
    }

    const routines = await Routine.find(query)
      .populate('workouts.exercise', 'name')
      .populate('weeklyPlan.workouts.exercise', 'name')
      .populate('user', 'account username')
      .exec()

    res.status(StatusCodes.OK).json({
      success: true,
      data: routines,
    })
  } catch (error) {
    console.log('controllers/routine.js getALl')
    console.error(error)

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || '伺服器內部錯誤',
    })
  }
}
export const deleteRoutine = async (req, res) => {
  try {
    const routineId = req.params.id
    const routine = await Routine.findById(routineId)

    if (!routine) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '找不到指定的課表',
      })
    }

    if (routine.user.toString() !== req.user._id.toString()) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: '無權限刪除此課表',
      })
    }

    await Routine.deleteOne({ _id: routineId })

    res.status(StatusCodes.OK).json({
      success: true,
      message: '課表刪除成功',
    })
  } catch (error) {
    console.log('controllers/routine.js deleteRoutine')
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || '伺服器內部錯誤',
    })
  }
}
export const updateRoutine = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id)

    if (!routine) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '找不到指定的課表',
      })
    }

    if (routine.user.toString() !== req.user._id.toString()) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: '無權限更新此課表',
      })
    }

    routine.title = req.body.title || routine.title
    routine.content = req.body.content || routine.content

    // 更新公開狀態（允許明確設為 false）
    if ('isPublic' in req.body) {
      routine.isPublic = req.body.isPublic
    }

    // 更新週計劃
    if (req.body.weeklyPlan && Array.isArray(req.body.weeklyPlan)) {
      const weeklyPlanWithId = await Promise.all(
        req.body.weeklyPlan.map(async (dayPlan) => {
          const workoutsWithId = await Promise.all(
            (dayPlan.workouts || []).map(async (w) => {
              let exerciseId = w.exercise

              if (typeof w.exercise === 'string' && w.exercise.length !== 24) {
                const exercise = await Exercise.findOne({ name: w.exercise })
                if (!exercise) {
                  throw new Error(`找不到動作名稱：${w.exercise}`)
                }
                exerciseId = exercise._id
              } else {
                const exercise = await Exercise.findById(exerciseId)
                if (!exercise) {
                  throw new Error(`找不到動作 ID：${exerciseId}`)
                }
              }

              return {
                exercise: exerciseId,
                sets: w.sets,
                reps: w.reps,
                rest: w.rest,
              }
            }),
          )

          return {
            day: dayPlan.day,
            name: dayPlan.name,
            workouts: workoutsWithId,
            notes: dayPlan.notes || '',
            isRestDay: dayPlan.isRestDay || false,
          }
        }),
      )
      routine.weeklyPlan = weeklyPlanWithId
    }

    // 更新舊版本的 workouts（向後相容）
    if (req.body.workouts && Array.isArray(req.body.workouts) && req.body.workouts.length > 0) {
      const workoutsWithId = await Promise.all(
        req.body.workouts.map(async (w) => {
          // 檢查 exercise 是否為有效的 ObjectId
          let exerciseId = w.exercise

          // 如果傳來的是字串（動作名稱），則查找對應的 ID
          if (typeof w.exercise === 'string' && w.exercise.length !== 24) {
            const exercise = await Exercise.findOne({ name: w.exercise })
            if (!exercise) {
              throw new Error(`找不到動作名稱：${w.exercise}`)
            }
            exerciseId = exercise._id
          } else {
            // 如果傳來的是 ObjectId，驗證是否存在
            const exercise = await Exercise.findById(exerciseId)
            if (!exercise) {
              throw new Error(`找不到動作 ID：${exerciseId}`)
            }
          }

          return {
            exercise: exerciseId,
            sets: w.sets,
            reps: w.reps,
            rest: w.rest,
          }
        }),
      )
      routine.workouts = workoutsWithId
    }

    await routine.save()

    res.status(StatusCodes.OK).json({
      success: true,
      message: '課表更新成功',
      data: routine,
    })
  } catch (error) {
    console.log('controllers/routine.js updateRoutine')
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || '伺服器內部錯誤',
    })
  }
}

// 獲取公開課表（按讚數排序）
export const getPublicRoutines = async (req, res) => {
  try {
    const routines = await Routine.find({ isPublic: true })
      .populate('workouts.exercise', 'name')
      .populate('weeklyPlan.workouts.exercise', 'name')
      .populate('user', 'account username')
      .sort({ likesCount: -1, createdAt: -1 })
      .exec()

    res.status(StatusCodes.OK).json({
      success: true,
      data: routines,
    })
  } catch (error) {
    console.log('controllers/routine.js getPublicRoutines')
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || '伺服內部錯誤',
    })
  }
}

// 獲取我的課表
export const getMyRoutines = async (req, res) => {
  try {
    const routines = await Routine.find({ user: req.user._id })
      .populate('workouts.exercise', 'name')
      .populate('weeklyPlan.workouts.exercise', 'name')
      .sort({ createdAt: -1 })
      .exec()

    res.status(StatusCodes.OK).json({
      success: true,
      data: routines,
    })
  } catch (error) {
    console.log('controllers/routine.js getMyRoutines')
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || '伺服器內部錯誤',
    })
  }
}

// 獲取我喜歡的課表
export const getLikedRoutines = async (req, res) => {
  try {
    const routines = await Routine.find({
      likes: req.user._id,
      isPublic: true,
    })
      .populate('workouts.exercise', 'name')
      .populate('weeklyPlan.workouts.exercise', 'name')
      .populate('user', 'account username')
      .sort({ createdAt: -1 })
      .exec()

    res.status(StatusCodes.OK).json({
      success: true,
      data: routines,
    })
  } catch (error) {
    console.log('controllers/routine.js getLikedRoutines')
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || '伺服器內部錯誤',
    })
  }
}

// 切換點讚狀態
export const toggleLike = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id)

    if (!routine) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '找不到指定的課表',
      })
    }

    if (!routine.isPublic) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: '無法對非公開課表按讚',
      })
    }

    const userId = req.user._id
    const likeIndex = routine.likes.indexOf(userId)

    if (likeIndex > -1) {
      // 取消讚
      routine.likes.splice(likeIndex, 1)
      routine.likesCount = Math.max(0, routine.likesCount - 1)
    } else {
      // 新增讚
      routine.likes.push(userId)
      routine.likesCount += 1
    }

    await routine.save()

    res.status(StatusCodes.OK).json({
      success: true,
      message: likeIndex > -1 ? '取消按讚成功' : '按讚成功',
      data: {
        liked: likeIndex === -1,
        likesCount: routine.likesCount,
      },
    })
  } catch (error) {
    console.log('controllers/routine.js toggleLike')
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || '伺服器內部錯誤',
    })
  }
}

// 更新課表公開狀態
export const updateVisibility = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id)

    if (!routine) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '找不到指定的課表',
      })
    }

    if (routine.user.toString() !== req.user._id.toString()) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: '無權限更新此課表',
      })
    }

    routine.isPublic = req.body.isPublic
    await routine.save()

    res.status(StatusCodes.OK).json({
      success: true,
      message: '課表公開狀態更新成功',
      data: routine,
    })
  } catch (error) {
    console.log('controllers/routine.js updateVisibility')
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || '伺服器內部錯誤',
    })
  }
}

// 管理員刪除任意課表
export const adminDeleteRoutine = async (req, res) => {
  try {
    const routineId = req.params.id
    const routine = await Routine.findById(routineId)

    if (!routine) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '找不到指定的課表',
      })
    }

    await Routine.findByIdAndDelete(routineId)

    res.status(StatusCodes.OK).json({
      success: true,
      message: '課表刪除成功',
    })
  } catch (error) {
    console.log('controllers/routine.js adminDeleteRoutine')
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || '伺服器內部錯誤',
    })
  }
}
