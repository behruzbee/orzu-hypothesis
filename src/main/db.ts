import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const MONGODB_URI = "mongodb+srv://behruzbaxtiyorovdev_db_user:Zvc0TJG7XQDpCL1v@cluster0.08ig0qj.mongodb.net/orzu_tracker?appName=Cluster0"

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Успешно подключено к MongoDB Cloud')

    // 🚀 АВТО-СОЗДАНИЕ ПЕРВОГО АДМИНА
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

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' } // <--- ДОБАВИЛИ РОЛЬ ('admin' или 'user')
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

export const User = mongoose.model('User', userSchema)

const hypothesisSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  title: String,
  description: String,
  assignee: String,
  status: String,
  createdAt: Number,
  metricName: String,
  targetAudience: String,
  pointA: Number,
  pointB: Number,
  actualPointB: Number,
  resultComment: String,
  durationValue: Number,
  durationUnit: String,
  priority: String,
  startedAt: Number,
})

export const HypothesisModel = mongoose.model('Hypothesis', hypothesisSchema)