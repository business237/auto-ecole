import { NavLink, Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const TABS = [
    { to: '/admin/formations', label: 'Formations' },
    { to: '/admin/offres', label: 'Offres spéciales' },
    { to: '/admin/personnel', label: 'Personnel' },
    { to: '/admin/galerie', label: 'Galerie' },
    { to: '/admin/inscriptions', label: 'Inscriptions' },
    { to: '/admin/messages', label: 'Messages' },
    { to: '/admin/infos', label: 'Infos pratiques' },
];

export default function AdminLayout() {
    async function handleLogout() {
        await supabase.auth.signOut();
    }

    return (
        <div className="min-h-screen bg-pacifique-offwhite">
            <header className="flex items-center justify-between border-b bg-white px-6 py-3.5">
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 overflow-hidden items-center justify-center rounded-xl bg-white shadow-sm border border-gray-200">
                        <img src="/images/logo.jpg" alt="Logo Auto-École Pacifique" className="h-full w-full object-contain" />
                    </span>
                    <div>
                        <h1 className="font-display font-bold text-base text-pacifique-navy-900 leading-none">
                            PACIFIQUE
                        </h1>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-pacifique-blue-600">
                            Administration
                        </span>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm text-pacifique-navy-700 hover:text-pacifique-red-500"
                >
                    <LogOut size={16} /> Déconnexion
                </button>
            </header>

            <nav className="flex gap-1 border-b bg-white px-6">
                {TABS.map((tab) => (
                    <NavLink
                        key={tab.to}
                        to={tab.to}
                        className={({ isActive }) =>
                            `border-b-2 px-4 py-3 text-sm font-medium transition ${isActive
                                ? 'border-pacifique-red-500 text-pacifique-navy-900'
                                : 'border-transparent text-pacifique-navy-700/60 hover:text-pacifique-navy-900'
                            }`
                        }
                    >
                        {tab.label}
                    </NavLink>
                ))}
            </nav>

            <main className="mx-auto max-w-5xl px-6 py-8">
                <Outlet />
            </main>
        </div>
    );
}