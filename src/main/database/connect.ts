// src/main/database/connect.ts
import { app } from 'electron'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'
import { usersTable } from './schema'

const envPath = app.isPackaged 
  ? path.join(process.resourcesPath, '.env') 
  : path.resolve(process.cwd(), '.env')

dotenv.config({ path: envPath })

const connectionString = process.env.DATABASE_URL
if (!connectionString) console.error('❌ Ошибка: DATABASE_URL не найден')

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false } 
})

// Экспортируем db для использования в обработчиках
export const db = drizzle(pool)

export const connectDB = async () => {
  try {
    await pool.query('SELECT 1')
    console.log('✅ Успешно подключено к PostgreSQL (Drizzle ORM)')
    
    const adminList = await db.select().from(usersTable).where(eq(usersTable.role, 'admin'))
    
    if (adminList.length === 0) {
      console.log('⏳ Создаю учетную запись админа...')
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      await db.insert(usersTable).values({
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      })
      console.log('👑 ПЕРВЫЙ ЗАПУСК: Создан администратор admin / admin123')
    }
  } catch (error) {
    console.error('❌ Ошибка инициализации PostgreSQL:', error)
  }
}