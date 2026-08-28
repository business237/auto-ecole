import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ScrollProgress } from '@/components/ui';
import PromoBanner from '@/components/PromoBanner';
export default function Layout() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className="min-h-screen bg-white">
            <ScrollProgress />
            <Navbar />
            <main>
                <Outlet />
            </main>
            <Footer />
            <PromoBanner />
        </div>
    );
}