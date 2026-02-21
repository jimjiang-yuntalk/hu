export const slugify = (text: string) => {
  let slug = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, "")
    .replace(/\s+/g, "-")

  if (!slug) slug = "section"
  if (/^[0-9]/.test(slug)) slug = `h-${slug}`
  return slug
}
