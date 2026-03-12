import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

// 1. Загружаем переменные окружения из .env
dotenv.config()

/**
 * Настройка подключения для Prisma 7
 * Мы используем драйвер 'pg' и официальный адаптер
 */
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('❌ Ошибка: DATABASE_URL не найден в .env файле')
}

// Создаем пул соединений с настройкой SSL для Railway
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false } // Позволяет подключаться к облачным БД без локальных сертификатов
})

// Оборачиваем пул в адаптер Prisma (используем as any из-за конфликта типов в @prisma/adapter-pg)
const adapter = new PrismaPg(pool as any)

// Экспортируем экземпляр Prisma для использования во всем приложении
export const prisma = new PrismaClient({ adapter })

/**
 * Главная функция инициализации базы данных
 */
export const connectDB = async () => {
  try {
    // Проверка соединения
    await prisma.$connect()
    console.log('✅ Успешно подключено к PostgreSQL (Prisma 7 Adapter)')

    // 🚀 ЛОГИКА АВТОМАТИЧЕСКОГО СОЗДАНИЯ АДМИНА
    // Ищем любого пользователя с ролью 'admin'
    const adminExists = await prisma.user.findFirst({
      where: { role: 'admin' }
    })

    if (!adminExists) {
      console.log('⏳ Админ не найден. Создаю учетную запись по умолчанию...')
      
      const defaultPassword = 'admin1234'
      const hashedPassword = await bcrypt.hash(defaultPassword, 10)

      await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          role: 'admin'
        }
      })

      console.log('-----------------------------------------------')
      console.log('👑 ПЕРВЫЙ ЗАПУСК: Создан администратор')
      console.log(`👤 Логин: admin`)
      console.log(`🔑 Пароль: ${defaultPassword}`)
      console.log('-----------------------------------------------')
    } else {
      console.log('ℹ️  Администратор уже существует в базе данных.')
    }

  } catch (error) {
    console.error('❌ Ошибка инициализации PostgreSQL:')
    console.error(error)
    
    // В Electron приложении важно не давать процессу виснуть при ошибке БД
    process.exit(1) 
  }
}