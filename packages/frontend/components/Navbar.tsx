'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Vote } from 'lucide-react';

const Navbar = () => {
    const pathname = usePathname();

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Admin', href: '/admin' },
    ];

    return (
        <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2 text-blue-500 font-bold text-xl">
                            <Vote size={28} />
                            <span className="hidden sm:inline">DecentraVote</span>
                        </Link>
                        <div className="hidden md:block ml-10 flex items-baseline space-x-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === link.href
                                            ? 'bg-blue-600 text-white'
                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <ConnectButton showBalance={false} chainStatus="icon" />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
