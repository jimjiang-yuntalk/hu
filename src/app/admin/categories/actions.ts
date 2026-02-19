'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  parentId: z.string().optional(),
  keywords: z.string().optional(),
})

export async function createCategory(formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    slug: formData.get('slug'),
    parentId: formData.get('parentId') || undefined,
    keywords: formData.get('keywords'),
  }

  const validatedData = createCategorySchema.parse(rawData)

  try {
    await prisma.category.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        parentId: validatedData.parentId === 'none' ? null : validatedData.parentId,
        keywords: validatedData.keywords,
      },
    })

    revalidatePath('/admin/categories')
    return { success: true }
  } catch (error) {
    console.error('Failed to create category:', error)
    return { success: false, error: 'Failed to create category' }
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({
      where: { id },
    })
    revalidatePath('/admin/categories')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete category:', error)
    return { success: false, error: 'Failed to delete category' }
  }
}
