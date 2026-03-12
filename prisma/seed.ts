import { PrismaClient, CourtArea, Difficulty } from '@prisma/client'

const prisma = new PrismaClient()

// Type definition for the seed data structure
type CategorySeed = {
  name: string
  slug: string
  icon?: string
  children: {
    name: string
    slug: string
    articles?: string[] 
  }[]
}

const seedData: CategorySeed[] = [
  {
    name: '技术 - 网前技术 (Technique - Net Play)',
    slug: 'technique-net',
    icon: 'Dumbbell',
    children: [
      { name: '搓球 (Spin Net Shot)', slug: 'spin-net-shot', articles: ['收搓', '展搓'] },
      { name: '放网 (Net Shot)', slug: 'net-shot', articles: ['正手放网', '反手放网'] },
      { name: '勾对角 (Cross Net Shot)', slug: 'cross-net-shot', articles: ['被动勾球', '主动勾球'] },
      { name: '推球 (Push)', slug: 'push', articles: ['推底线', '推腰'] },
      { name: '扑球 (Net Kill)', slug: 'net-kill', articles: ['封网技术', '扑球时机'] },
      { name: '挑球 (Lift)', slug: 'lift', articles: ['正手挑球', '反手挑球'] },
    ]
  },
  {
    name: '技术 - 中场技术 (Technique - Mid-court)',
    slug: 'technique-mid',
    icon: 'Dumbbell',
    children: [
      { name: '平抽挡 (Drive)', slug: 'drive', articles: ['主动平抽', '被动挡网'] },
      { name: '接杀球 (Smash Defense)', slug: 'smash-defense', articles: ['挡网', '抽底线', '挑后场'] },
      { name: '拦截 (Interception)', slug: 'interception', articles: ['封网意识', '中场拦截'] },
    ]
  },
  {
    name: '后场技术 (Technique - Rear-court)',
    slug: 'technique-rear',
    icon: 'Dumbbell',
    children: [
      { name: '高远球 (Clear)', slug: 'clear', articles: ['正手高远', '头顶高远', '被动高远'] },
      { name: '吊球 (Drop Shot)', slug: 'drop-shot', articles: ['劈吊 (Slice)', '滑板吊', '拦截吊'] },
      { name: '杀球 (Smash)', slug: 'smash', articles: ['重杀 (Full Smash)', '点杀 (Stick Smash)', '劈杀'] },
      { name: '被动过渡 (Recovery)', slug: 'recovery', articles: ['反手高远球', '反手过渡网前'] },
    ]
  },
  {
    name: '步法体系 (Footwork System)',
    slug: 'footwork',
    icon: 'Footprints',
    children: [
      { name: '基础步法', slug: 'footwork-basic', articles: ['启动步 (Split Step)', '回动 (Recovery)', '制动 (Braking)'] },
      { name: '网前步法', slug: 'footwork-net', articles: ['蹬跨步 (Lunge)', '交叉步上网'] },
      { name: '后退步法', slug: 'footwork-back', articles: ['马来步 (Round-the-head)', '侧身并步', '中国跳 (Scissors Kick)'] },
      { name: '连贯步法', slug: 'footwork-continuity', articles: ['全场步法跑动', '重心转换'] },
    ]
  },
  {
    name: '战术意识 (Tactics)',
    slug: 'tactics',
    icon: 'Swords',
    children: [
      { name: '单打 (Singles)', slug: 'tactics-singles', articles: ['拉吊突击', '控制底线', '变速突击'] },
      { name: '双打 (Doubles)', slug: 'tactics-doubles', articles: ['进攻轮转 (Rotation)', '防守站位', '攻中路战术'] },
      { name: '混双 (Mixed)', slug: 'tactics-mixed', articles: ['女前男后站位', '封网补位'] },
    ]
  },
  {
    name: '身体素质与康复 (Physical & Rehab)',
    slug: 'physical',
    icon: 'Activity', 
    children: [
      { name: '力量训练', slug: 'strength', articles: ['上肢爆发力', '核心稳定性', '下肢力量'] },
      { name: '体能耐力', slug: 'endurance', articles: ['多球无氧训练', '有氧耐力'] },
      { name: '伤病防护', slug: 'rehab', articles: ['膝盖保护', '手腕热身', '网球肘康复'] },
    ]
  },
  {
    name: '器材与规则 (Gear & Rules)',
    slug: 'gear-rules',
    icon: 'BookOpen',
    children: [
      { name: '球拍与线', slug: 'racket-string', articles: ['拍框特性', '中杆硬度', '拍线磅数选择'] },
      { name: '场地与规则', slug: 'court-rules', articles: ['场地尺寸', '发球违例判罚', '计分规则'] },
    ]
  }
]

async function main() {
  console.log('Start seeding...')

  // Clean up existing data
  await prisma.article.deleteMany()
  await prisma.category.deleteMany()

  let order = 1
  for (const rootCat of seedData) {
    console.log(`Creating root category: ${rootCat.name}`)
    
    const parent = await prisma.category.create({
      data: {
        name: rootCat.name,
        slug: rootCat.slug,
        icon: rootCat.icon,
        order: order++,
      }
    })

    let childOrder = 1
    for (const childCat of rootCat.children) {
      const child = await prisma.category.create({
        data: {
          name: childCat.name,
          slug: childCat.slug,
          parentId: parent.id,
          order: childOrder++,
        }
      })

      // Create placeholder articles if defined
      if (childCat.articles) {
        for (const articleTitle of childCat.articles) {
           // Basic logic to guess court area based on slug/name for demo purposes
           let courtArea: CourtArea = CourtArea.Full;
           if (rootCat.slug.includes('net')) courtArea = CourtArea.Net;
           if (rootCat.slug.includes('mid')) courtArea = CourtArea.Mid;
           if (rootCat.slug.includes('rear')) courtArea = CourtArea.Rear;

           await prisma.article.create({
             data: {
               title: articleTitle,
               content: `<h3>${articleTitle}</h3><p>Content for ${articleTitle}...</p>`,
               categories: {
                 connect: [{ id: child.id }]
               },
               difficulty: Difficulty.L1_Beginner, // Default
               court_area: courtArea
             }
           })
        }
      }
    }
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
