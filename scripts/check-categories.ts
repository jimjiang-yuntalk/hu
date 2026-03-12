
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { name: { contains: "中场技术" } },
        { name: { contains: "后场技术" } }
      ]
    }
  })
  console.log(JSON.stringify(categories, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
