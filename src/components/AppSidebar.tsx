import { SidebarClient } from '@/components/SidebarClient'

interface AppSidebarProps {
  isMobile?: boolean
}

export async function AppSidebar({ isMobile = false }: AppSidebarProps) {
  return <SidebarClient isMobile={isMobile} />
}
