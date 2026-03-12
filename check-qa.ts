import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const qaHistory = await prisma.qaHistory.findMany()
  console.log(`QA History records: ${qaHistory.length}`)
  
  if (qaHistory.length > 0) {
    console.log('Sample QA records:')
    qaHistory.slice(0, 5).forEach((qa, index) => {
      console.log(`${index + 1}. Question: ${qa.question.substring(0, 50)}...`)
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })