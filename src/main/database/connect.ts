import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { User } from './models/User'

// В идеале вынести в .env, но пока оставим так
const MONGODB_URI = "mongodb+srv://behruzbaxtiyorovdev_db_user:Zvc0TJG7XQDpCL1v@cluster0.08ig0qj.mongodb.net/orzu_tracker?appName=Cluster0"

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Успешно подключено к MongoDB Cloud')

    const adminExists = await User.findOne({ role: 'admin' })
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      await User.create({ username: 'admin', password: hashedPassword, role: 'admin' })
      console.log('👑 Создан первый админ! Логин: admin | Пароль: admin123')
    }
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error)
  }
}