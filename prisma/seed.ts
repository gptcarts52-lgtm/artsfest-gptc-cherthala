import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seed...')

    // 1. Create Houses
    console.log('Creating houses...')
    const houseNames = [
        { name: 'കോച്ചേരി', color: '#4A90E2', description: 'Kochery House' },
        { name: 'നറാച്ചി', color: '#F5A623', description: 'Narachi House' },
        { name: 'ഗദ്വാൾ', color: '#7ED321', description: 'Gadwal House' },
        { name: 'നിരപ്പേൽ', color: '#9013FE', description: 'Nirappel House' },
        { name: 'മഹിഷ്മതി', color: '#D0021B', description: 'Mahishmathi House' }
    ]

    for (const h of houseNames) {
        await prisma.house.upsert({
            where: { name: h.name },
            update: { color: h.color, description: h.description },
            create: {
                name: h.name,
                color: h.color,
                description: h.description,
                isGirlsHouse: false,
            },
        })
    }
    console.log(`✅ Created ${houseNames.length} houses`)

    // 2. Create Configurations
    console.log('Creating configurations...')
    const configs = [
        { key: 'maxOnStageSolo', value: '4', description: 'Max individual on-stage programs' },
        { key: 'maxOnStageGroup', value: '2', description: 'Max group on-stage programs' },
        { key: 'maxOffStageTotal', value: '3', description: 'Max total off-stage items' },
        { key: 'minAttendanceForCertificate', value: '1', description: 'Min attendance for cert' },
        { key: 'festivalName', value: 'ArtsFest GPTC Cherthala', description: 'Festival Name' },
        { key: 'festivalYear', value: new Date().getFullYear().toString(), description: 'Festival Year' },
        {
            key: 'departments',
            value: JSON.stringify([
                { code: 'CHE', name: 'Computer Hardware Engineering' },
                { code: 'CT', name: 'Computer Engineering' },
                { code: 'ME', name: 'Mechanical Engineering' },
                { code: 'IE', name: 'Instrumentation Engineering' },
                { code: 'EC', name: 'Electronics & Communication' },
            ]),
            description: 'List of departments'
        },
        { key: 'galleryText', value: 'Moments of Creativity', description: 'Gallery text' },
        { key: 'notifications', value: '[]', description: 'Site notifications' },
        { key: 'galleryImages', value: '[]', description: 'Gallery image URLs' },
        { key: 'certificateTemplate', value: '', description: 'Certificate template URL' },
        {
            key: 'smtpConfig',
            value: JSON.stringify({
                host: 'smtp.gmail.com',
                port: 587,
                user: '',
                pass: '',
                secure: false
            }),
            description: 'SMTP settings (JSON)'
        }
    ]

    for (const c of configs) {
        await prisma.configuration.upsert({
            where: { key: c.key },
            update: { value: c.value, description: c.description },
            create: c
        })
    }
    console.log(`✅ Created ${configs.length} configurations`)

    // 3. Create Master Admin User
    console.log('Creating master admin user...')
    const hashedMasterPassword = await bcrypt.hash('master@artsfest', 10)
    await prisma.user.upsert({
        where: { email: 'master@gptc.ac.in' },
        update: {},
        create: {
            fullName: 'Master Admin',
            email: 'master@gptc.ac.in',
            password: hashedMasterPassword,
            studentAdmnNo: 'MASTER001',
            gender: 'MALE',
            role: 'MASTER',
            department: 'System',
        },
    })
    console.log('✅ Created master admin user (master@gptc.ac.in / master@artsfest)')

    // 4. Create Programs
    console.log('Creating programs...')
    const soloItems = [
        'ശാസ്ത്രീയ സംഗീതം', 'ലളിത ഗാനം', 'മാപ്പിളപ്പാട്ട്', 'കഥകളി', 'ഓട്ടൻതുള്ളൽ',
        'നാടോടി നൃത്തം', 'ഭരതനാട്യം', 'കുച്ചുപ്പുടി', 'ചാക്യാർകൂത്ത്', 'മോഹിനിയാട്ടം',
        'പദ്യം ചൊല്ലൽ', 'മോണോ ആക്ട്', 'മിമിക്രി ആക്ട്', 'വയലിൻ', 'ഗിറ്റാർ',
        'ഓടക്കുഴൽ', 'മൃദംഗം'
    ]

    const groupItems = [
        'സംഘനൃത്തം', 'തിരുവാതിര', 'മാർഗംകളി', 'ഒപ്പന', 'വട്ടപ്പാട്ട്', 'സംഘഗാനം',
        'ഗാനമേള', 'നാടകം', 'മുകാഭിനയം', 'ചെണ്ടമേളം', 'വൃന്ദാവാദ്യം', 'പഞ്ചവാദ്യം',
        'നാടൻപാട്ട്', 'പരിചയമുട്ടുകളി', 'കോൽക്കളി', 'ദഫ്മുട്ട്', 'പൂരക്കളി',
        'ചെണ്ട (തായമ്പക)', 'മദ്ദളം', 'തബല', 'ദേശഭക്തി ഗാനം', 'കഥാപ്രസംഗം'
    ]

    for (const item of soloItems) {
        await prisma.program.upsert({
            where: { name: item },
            update: { type: 'SOLO', category: 'ON_STAGE' },
            create: {
                name: item,
                type: 'SOLO',
                category: 'ON_STAGE',
                minMembers: 1,
                maxMembers: 1,
                isActive: true
            }
        })
    }

    for (const item of groupItems) {
        await prisma.program.upsert({
            where: { name: item },
            update: { type: 'GROUP', category: 'ON_STAGE' },
            create: {
                name: item,
                type: 'GROUP',
                category: 'ON_STAGE',
                minMembers: 2,
                maxMembers: 20, // General limit for groups
                isActive: true
            }
        })
    }
    console.log(`✅ Created ${soloItems.length} solo and ${groupItems.length} group programs`)

    console.log('🎉 Database seed completed successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
