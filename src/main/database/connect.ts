import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
})

const adapter = new PrismaPg(pool as any)

export const prisma = new PrismaClient({ adapter })

export const connectDB = async () => {
  try {
    await prisma.$connect()
    console.log('✅ PostgreSQL подключен через Prisma 7 Adapter')

    const adminExists = await prisma.user.findFirst({
      where: { role: 'admin' }
    })

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          role: 'admin'
        }
      })
      console.log('👑 Админ создан в Postgres!')
    }
  } catch (error) {
    console.error('❌ Ошибка подключения:', error)
  }
}