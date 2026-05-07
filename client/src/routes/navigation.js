import {
  Bell,
  FolderOpen,
  LayoutDashboard,
  ListTodo,
  PanelsTopLeft,
  UserCircle2,
} from 'lucide-react'

export const navigationItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderOpen },
  { to: '/board', label: 'Board', icon: PanelsTopLeft },
  { to: '/my-tasks', label: 'My Tasks', icon: ListTodo },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile', icon: UserCircle2 },
]
