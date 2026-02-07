
import { PrismaClient, Role, Gender } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'master@gptc.com'
    const password = 'password123'
    const hashedPassword = await bcrypt.hash(password, 10)

    // Ensure house exists for user creation (though admin usually doesn't need one strictly, schema might require it or not)
    // Schema: houseId String? (Optional) -> Good.

    try {
        // Check if exists
        const existing = await prisma.user.findUnique({ where: { email } })

        if (existing) {
            await prisma.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    role: 'MASTER' as Role, // Explicit cast in case client not fully refreshed in editor context
                }
            })
            console.log('Updated existing user to MASTER.')
        } else {
            await prisma.user.create({
                data: {
                    fullName: 'Master Admin',
                    email,
                    password: hashedPassword,
                    role: 'MASTER' as Role,
                    studentAdmnNo: 'MASTER001', // Unique constraint
                    gender: 'OTHER' as Gender,
                    department: 'ADMINISTRATION'
                }
            })
            console.log('Created new MASTER user.')
        }

        console.log('\n--- MASTER CREDENTIALS ---')
        console.log(`Email:    ${email}`)
        console.log(`Password: ${password}`)
        console.log('--------------------------\n')

    } catch (e) {
        console.error('Error creating master user:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
