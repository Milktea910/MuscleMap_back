import Inbody from '../models/inbody.js'
import { StatusCodes } from 'http-status-codes'
import validator from 'validator'

export const create = async (req, res) => {
  try {
    const inbodyData = {
      user: req.user._id,
      weight: req.body.weight,
      fat: req.body.fat,
      muscleMass: req.body.muscleMass,
    }

    // 如果有提供記錄日期，就使用它；否則使用預設值
    if (req.body.recordDate) {
      inbodyData.recordDate = new Date(req.body.recordDate)
    }

    await Inbody.create(inbodyData)

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: '',
    })
  } catch (error) {
    console.log('controllers/inbody.js create')
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '伺服器內部錯誤',
    })
  }
}
export const profile = async (req, res) => {
  try {
    const inbodyData = await Inbody.findOne({ user: req.user._id }).select('-user -__v')
    if (!inbodyData) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '找不到身體數據',
      })
    }

    res.status(StatusCodes.OK).json({
      success: true,
      inbody: inbodyData,
    })
  } catch (error) {
    console.log('controllers/inbody.js profile')
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '伺服器內部錯誤',
    })
  }
}
export const deleteById = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) {
      throw new Error('INBODY ID')
    }
    await Inbody.findByIdAndDelete(req.params.id).orFail(new Error('INBODY NOT FOUND'))
    res.status(StatusCodes.OK).json({
      success: true,
      message: '身體數據已刪除',
    })
  } catch (error) {
    console.log('controllers/inbody.js deleteById')
    console.error(error)
    if (error.message === 'INBODY ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '無效的身體數據 ID',
      })
    } else if (error.message === 'INBODY NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '身體數據不存在',
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '伺服器內部錯誤',
      })
    }
  }
}

export const updateById = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) {
      throw new Error('INBODY ID')
    }

    const updateData = {
      weight: req.body.weight,
      fat: req.body.fat,
      muscleMass: req.body.muscleMass,
    }

    // 如果有提供記錄日期，就更新它
    if (req.body.recordDate) {
      updateData.recordDate = new Date(req.body.recordDate)
    }

    const updatedInbody = await Inbody.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).orFail(new Error('INBODY NOT FOUND'))

    res.status(StatusCodes.OK).json({
      success: true,
      message: '身體數據已更新',
      inbody: updatedInbody,
    })
  } catch (error) {
    console.log('controllers/inbody.js updateById')
    console.error(error)
    if (error.message === 'INBODY ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '無效的身體數據 ID',
      })
    } else if (error.message === 'INBODY NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '身體數據不存在',
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '伺服器內部錯誤',
      })
    }
  }
}
export const getById = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) {
      throw new Error('INBODY ID')
    }
    const inbody = await Inbody.findById(req.params.id).orFail(new Error('INBODY NOT FOUND'))

    res.status(StatusCodes.OK).json({
      success: true,
      inbody,
    })
  } catch (error) {
    console.log('controllers/inbody.js getById')
    console.error(error)
    if (error.message === 'INBODY ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '無效的身體數據 ID',
      })
    } else if (error.message === 'INBODY NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '身體數據不存在',
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
    // 只取得當前使用者的資料，並按記錄日期排序
    const inbodies = await Inbody.find({ user: req.user._id })
      .select('-user -__v')
      .sort({ recordDate: 1 }) // 按記錄日期升序排列

    res.status(StatusCodes.OK).json({
      success: true,
      inbodies,
    })
  } catch (error) {
    console.log('controllers/inbody.js getAll')
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '伺服器內部錯誤',
    })
  }
}
