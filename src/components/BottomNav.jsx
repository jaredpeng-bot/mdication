import { NavLink } from 'react-router-dom'
import { CalendarDays, ClipboardList, Pill, UserRound } from 'lucide-react'

const navItems = [
  { to: '/', label: '用药', icon: Pill },
  { to: '/record', label: '记录', icon: ClipboardList },
  { to: '/checkup', label: '复诊', icon: CalendarDays },
  { to: '/profile', label: '我的', icon: UserRound },
]

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto w-full max-w-[480px] border-t border-slate-200 bg-white/95 px-4 pb-3 pt-2 backdrop-blur">
      <ul className="grid grid-cols-4 gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center rounded-xl py-1 text-xs transition ${isActive ? 'text-medicalBlue' : 'text-slate-400'}`
                }
              >
                <Icon size={20} />
                <span className="mt-1">{item.label}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default BottomNav
