import { NavLink } from 'react-router-dom'
import {
  Lightbulb,
  FlaskConical,
  PlayCircle,
  CheckCircle,
  XCircle,
  Users,
  BarChart,
  Shield
} from 'lucide-react'
import { Logo } from '@renderer/shared/ui/logo'
import { useAuthStore } from '@renderer/shared/store/use-auth-store'

export const Sidebar = () => {
  const role = useAuthStore((state) => state.role)
  return (
    <nav className="w-[260px] bg-white border-r border-slate-200 p-5 flex flex-col gap-2">
      <Logo />

      <NavItem to="/" icon={<Lightbulb size={20} />} text="Идеи" />
      <NavItem to="/ready" icon={<FlaskConical size={20} />} text="Готов к тесту" />
      <NavItem to="/progress" icon={<PlayCircle size={20} />} text="В тестировании" />
      <NavItem to="/success" icon={<CheckCircle size={20} />} text="Успешно" />
      <NavItem to="/failed" icon={<XCircle size={20} />} text="Провалено" />
      <NavItem to="/discuss" icon={<Users size={20} />} text="Надо обсудить" />

      <hr className="my-3 border-slate-200" />

      <NavItem to="/stats" icon={<BarChart size={20} />} text="Статистика" />
      {role === 'admin' && (
        <NavLink
          to="/admin"
          className="flex items-center gap-2 p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-orzu transition-colors"
        >
          <Shield size={18} />
          <span className="font-bold">Управление доступом</span>
        </NavLink>
      )}
    </nav>
  )
}

const NavItem = ({ to, icon, text }: { to: string; icon: React.ReactNode; text: string }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 p-3 rounded-lg no-underline font-medium transition-all duration-200 ${
          isActive
            ? 'bg-orzu text-white shadow-md shadow-orzu/20'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
        }`
      }
    >
      {icon} {text}
    </NavLink>
  )
}
