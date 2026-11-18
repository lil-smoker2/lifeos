import {
  BookOpen, Bot, CalendarDays, FolderOpen, GraduationCap, Heart, HelpCircle,
  LayoutDashboard, Settings, Target, WalletCards, Zap,
} from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/planner', label: 'Planner', icon: CalendarDays },
  { to: '/learning', label: 'Study & Learning', icon: GraduationCap },
  { to: '/finance', label: 'Finance', icon: WalletCards },
  { to: '/health', label: 'Health & Fitness', icon: Heart },
  { to: '/notes', label: 'Notes & Knowledge', icon: BookOpen },
  { to: '/files', label: 'Files & Documents', icon: FolderOpen },
  { to: '/goals', label: 'Goals & Habits', icon: Target },
  { to: '/ai', label: 'AI Assistant', icon: Bot, badge: 'New' },
  { to: '/automation', label: 'Automation', icon: Zap },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/help', label: 'Help & Support', icon: HelpCircle },
]
