
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Update "技术 - 中场技术"
  await prisma.category.updateMany({
    where: {
      name: {
        contains: "技术 - 中场技术 (Technique - Mid-court)"
      }
    },
    data: {
      name: "中场技术 (Technique - Mid-court)"
    }
  })
  console.log('Updated 中场技术')

  // Update "技术 - 后场技术"
  await prisma.category.updateMany({
    where: {
      name: {
        contains: "技术 - 后场技术 (Technique - Rear-court)"
      }
    },
    data: {
      name: "后场技术 (Technique - Rear-court)"
    }
  })
  console.log('Updated 后场技术')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
