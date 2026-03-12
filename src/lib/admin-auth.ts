const ADMIN_AUTH_SALT = process.env.ADMIN_AUTH_SALT || 'badminton-kb-admin-auth-v1'

// 轻量级不可逆摘要（用于避免在 Cookie 中保存明文密码）
export function buildAdminAuthToken(password: string) {
  const input = `${ADMIN_AUTH_SALT}:${password}`
  let hash = 0x811c9dc5

  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }

  return `v1_${(hash >>> 0).toString(16)}`
}
