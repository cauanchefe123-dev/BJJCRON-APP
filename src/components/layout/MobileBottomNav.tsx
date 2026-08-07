import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  LayoutDashboard,
  QrCode,
  IdCard,
  BookOpen,
  Users,
  Timer,
  MessageSquareQuote,
  Menu,
  Bell
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSidebar: () => void;
  onOpenNotifications: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenSidebar,
  onOpenNotifications,
}) => {
  const { currentUser } = useAuth();
  const { notifications } = useData();

  if (!currentUser) return null;

  const userId = currentUser.id || 'guest';
  const unreadNotifsCount = notifications.filter(n => !n.readBy.includes(userId)).length;

  const role = currentUser.role;

  // Tabs based on user role
  const isStudent = role === 'ALUNO';

  const navItems = isStudent
    ? [
        { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
        { id: 'card', label: 'Carteirinha', icon: IdCard },
        { id: 'attendance', label: 'Frequência', icon: QrCode },
        { id: 'journal', label: 'Diário', icon: BookOpen },
      ]
    : [
        { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
        { id: 'attendance', label: 'Presença', icon: QrCode },
        { id: 'students', label: 'Alunos', icon: Users },
        { id: 'timer', label: 'Timer', icon: Timer },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 lg:hidden print:hidden shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all min-w-[62px] ${
                isActive
                  ? 'text-amber-400 font-extrabold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400 stroke-[2.5]' : 'text-slate-400 stroke-[1.8]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-xs shadow-amber-400" />
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'text-amber-400 font-black' : 'text-slate-400 font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Notifications Button */}
        <button
          onClick={onOpenNotifications}
          className="relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all min-w-[62px]"
        >
          <div className="relative">
            <Bell className="w-5 h-5 text-slate-400 stroke-[1.8]" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black flex items-center justify-center animate-pulse">
                {unreadNotifsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 text-slate-400 font-medium tracking-tight">
            Avisos
          </span>
        </button>

        {/* More Menu Drawer Button */}
        <button
          onClick={onOpenSidebar}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all min-w-[62px]"
        >
          <Menu className="w-5 h-5 text-slate-400 stroke-[1.8]" />
          <span className="text-[10px] mt-1 text-slate-400 font-medium tracking-tight">
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
};
