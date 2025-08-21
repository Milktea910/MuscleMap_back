import Exercise from '../models/exercise.js'
import { StatusCodes } from 'http-status-codes'
import validator from 'validator'

export const create = async (req, res) => {
  try {
    // 處理目標肌群陣列
    let targetMuscle = req.body.targetMuscle
    if (typeof targetMuscle === 'string') {
      targetMuscle = [targetMuscle]
    } else if (Array.isArray(targetMuscle)) {
      targetMuscle = targetMuscle.filter((muscle) => muscle && muscle.trim())
    }

    // 處理注意事項陣列
    let notes = req.body.notes
    if (typeof notes === 'string') {
      notes = [notes]
    } else if (Array.isArray(notes)) {
      notes = notes.filter((note) => note && note.trim())
    }

    await Exercise.create({
      name: req.body.name,
      equipment: req.body.equipment,
      difficulty: req.body.difficulty,
      targetMuscle: targetMuscle,
      video: req.file.path,
      notes: notes,
    })

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: '',
    })
  } catch (error) {
    console.log('controllers/exercise.js create')
    console.error(error)
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.errors[key].message,
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '伺服器內部錯誤',
      })
    }
  }
}
export const update = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) {
      throw new Error('EXERCISE ID')
    }

    // 處理目標肌群陣列
    let targetMuscle = req.body.targetMuscle
    if (typeof targetMuscle === 'string') {
      targetMuscle = [targetMuscle]
    } else if (Array.isArray(targetMuscle)) {
      targetMuscle = targetMuscle.filter((muscle) => muscle && muscle.trim())
    }

    // 處理注意事項陣列
    let notes = req.body.notes
    if (typeof notes === 'string') {
      notes = [notes]
    } else if (Array.isArray(notes)) {
      notes = notes.filter((note) => note && note.trim())
    }

    const exercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        targetMuscle: targetMuscle,
        notes: notes,
        image: req.file?.path,
      },
      { new: true, runValidators: true },
    ).orFail(new Error('EXERCISE NOT FOUND'))

    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      exercise,
    })
  } catch (error) {
    console.log('controllers/exercise.js update')
    console.error(error)
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.errors[key].message,
      })
    } else if (error.message === 'EXERCISE ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '無效的運動 ID',
      })
    } else if (error.message === 'EXERCISE NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '運動資料不存在',
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '伺服器內部錯誤',
      })
    }
  }
}
export const getAll = async (req, res) => {
  try {
    const exercises = await Exercise.find().sort({ createdAt: -1 })

    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      exercises,
    })
  } catch (error) {
    console.log('controllers/exercise.js getAll')
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '伺服器內部錯誤',
    })
  }
}
export const getById = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) {
      throw new Error('EXERCISE ID')
    }
    const exercise = await Exercise.findById(req.params.id).orFail(new Error('EXERCISE NOT FOUND'))

    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      exercise,
    })
  } catch (error) {
    console.log('controllers/exercise.js getById')
    console.error(error)
    if (error.message === 'EXERCISE ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '無效的運動 ID',
      })
    } else if (error.message === 'EXERCISE NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '運動資料不存在',
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '伺服器內部錯誤',
      })
    }
  }
}
export const deleteById = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) {
      throw new Error('EXERCISE ID')
    }
    await Exercise.findByIdAndDelete(req.params.id).orFail(new Error('EXERCISE NOT FOUND'))

    res.status(StatusCodes.OK).json({
      success: true,
      message: '運動資料已刪除',
    })
  } catch (error) {
    console.log('controllers/exercise.js deleteById')
    console.error(error)
    if (error.message === 'EXERCISE ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '無效的運動 ID',
      })
    } else if (error.message === 'EXERCISE NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '運動資料不存在',
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '伺服器內部錯誤',
      })
    }
  }
}
