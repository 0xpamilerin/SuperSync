import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
async function main() {
  console.log('Seeding database...')

  // 1. Create Departments
  const csc = await prisma.department.upsert({
    where: { code: 'CSC' },
    update: {},
    create: { name: 'Computer Science', code: 'CSC' },
  })

  const se = await prisma.department.upsert({
    where: { code: 'SE' },
    update: {},
    create: { name: 'Software Engineering', code: 'SE' },
  })

  // 2. Create Session
  const session = await prisma.session.upsert({
    where: { title: '2023/2024' },
    update: {},
    create: { title: '2023/2024', startDate: new Date('2023-09-01'), endDate: new Date('2024-07-31'), isActive: true },
  })

  const hashedPassword = await bcrypt.hash('password123', 10)

  // 3. Create Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ui.edu.ng' },
    update: { password: hashedPassword },
    create: {
      name: 'System Admin',
      email: 'admin@ui.edu.ng',
      password: hashedPassword,
      role: 'ADMIN',
      adminProfile: {
        create: {}
      }
    }
  })

  // 4. Create Supervisors
  const supervisorUser = await prisma.user.upsert({
    where: { email: 'dr.smith@ui.edu.ng' },
    update: { password: hashedPassword },
    create: {
      name: 'Dr. Smith',
      email: 'dr.smith@ui.edu.ng',
      password: hashedPassword,
      role: 'SUPERVISOR',
      supervisorProfile: {
        create: {
          staffId: 'STAFF123',
          departmentId: csc.id,
          maxStudents: 5
        }
      }
    }
  })

  const supervisorProfile = await prisma.supervisorProfile.findUnique({
    where: { userId: supervisorUser.id }
  })

  // 5. Create Students
  const studentUser = await prisma.user.upsert({
    where: { email: 'john.doe@stu.ui.edu.ng' },
    update: { password: hashedPassword },
    create: {
      name: 'John Doe',
      email: 'john.doe@stu.ui.edu.ng',
      password: hashedPassword,
      role: 'STUDENT',
      studentProfile: {
        create: {
          matricNumber: '201234',
          departmentId: csc.id,
          level: 400,
          supervisorId: supervisorProfile?.id
        }
      }
    }
  })

  console.log('Database seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
