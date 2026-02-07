import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function fillDummy() {
    console.log('Filling extensive dummy data...')

    // 1. Ensure Houses
    const houses = await prisma.house.findMany()
    if (houses.length === 0) return console.error('No houses found. Run seed first.')

    // 2. Sample Programs (ensure some are present)
    const programs = await prisma.program.findMany()
    if (programs.length === 0) return console.error('No programs found. Run seed first.')

    // 3. Create 10 more random students
    const depts = ['Computer Engineering', 'Mechanical Engineering', 'Electronics & Communication']
    const sems = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6']

    for (let i = 10; i < 20; i++) {
        const house = houses[i % houses.length]
        const email = `student${i}@example.com`

        const user = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                fullName: `Test Student ${i}`,
                email,
                password: 'hashed_password_here', // In real use, use bcrypt
                studentAdmnNo: `24AD${100 + i}`,
                gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
                department: depts[i % depts.length],
                semester: sems[i % sems.length],
                houseId: house.id,
                role: 'STUDENT'
            }
        })

        // Register for 2 programs
        for (let j = 0; j < 2; j++) {
            const prog = programs[(i + j) % programs.length]
            const reg = await prisma.registration.create({
                data: {
                    userId: user.id,
                    programId: prog.id,
                    houseId: house.id,
                    category: prog.category,
                    isGroup: false,
                    status: 'CONFIRMED'
                }
            })

            // Mark half as present
            if (i % 2 === 0) {
                await prisma.attendance.create({
                    data: {
                        registrationId: reg.id,
                        userId: user.id,
                        programId: prog.id,
                        markedBy: 'ADMIN_ID_PLACEHOLDER', // You'd need a real ID here
                        isPresent: true
                    }
                }).catch(() => { }) // Ignore if error (e.g. marker not found)

                // Assign random results
                const grades = ['WINNER', 'FIRST_RUNNER_UP', 'SECOND_RUNNER_UP', 'PARTICIPATION']
                const grade = grades[j % grades.length]
                const scores: any = { WINNER: 5, FIRST_RUNNER_UP: 4, SECOND_RUNNER_UP: 3, PARTICIPATION: 2 }

                await prisma.registration.update({
                    where: { id: reg.id },
                    data: { grade, score: scores[grade] || 2 }
                })
            }
        }
    }

    console.log('✅ Extensive dummy data populated.')
}

fillDummy().catch(console.error)
