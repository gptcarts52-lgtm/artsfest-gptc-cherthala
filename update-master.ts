
import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'karankbinu799@gmail.com'
    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'MASTER' as Role }
        })
        console.log(`Successfully updated user ${email} to MASTER role.`)
    } catch (e) {
        console.error(`Failed to update user ${email}:`, e)
        // Optional: Create if not exists (though user instructions imply assignment meaning user exists)
        // But if he doesn't exist, we might want to know.
    } finally {
        await prisma.$disconnect()
    }
}

main()
