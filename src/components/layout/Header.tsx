"use client";

import {Bell, X, Menu} from "lucide-react";
import {useState, useEffect} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useNotifications} from "@/context/NotificationContext";

interface HeaderProps {
    onMenuClick?: () => void;
}

export function Header({onMenuClick}: HeaderProps) {
    const {notifications, unreadCount, markAsRead} = useNotifications();
    const [showNotifications, setShowNotifications] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);

    const router = useRouter();

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleNotificationClick = (notification: any) => {
        markAsRead(notification.id);
        setShowNotifications(false);
        router.push(notification.targetUrl);
    };

    return (
        <header
            className="flex h-16 items-center gap-x-3 sm:gap-x-6 border-b border-slate-200 bg-white px-4 sm:px-6 shadow-sm relative z-20">
            <button
                type="button"
                className="text-slate-500 lg:hidden hover:text-slate-700 flex-none"
                onClick={onMenuClick}
            >
                <Menu className="h-6 w-6"/>
            </button>

            <div className="flex items-center gap-x-4 relative flex-none ml-auto">

                {mounted && (
                    <div className="relative">
                        <div>
                            <button
                                type="button"
                                className={`-m-2.5 p-2.5 text-slate-400 hover:text-slate-500 relative ${showNotifications ? 'text-blue-600' : ''}`}
                                style={{margin: "0 auto"}}
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <span className="sr-only">Benachrichtigungen anzeigen</span>
                                <Bell className="h-6 w-6" aria-hidden="true"/>
                                {unreadCount > 0 && (
                                    <span
                                        className="absolute top-1.5 right-1.5 flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
                                )}
                            </button>
                        </div>

                        {showNotifications && (
                            <div
                                className="absolute right-[-40px] sm:right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-xs sm:max-w-none origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-blue-300 ring-opacity-5 focus:outline-none z-50">
                                <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                                    <span className="font-semibold text-sm text-slate-900">Benachrichtigungen</span>
                                    <button onClick={() => setShowNotifications(false)}
                                            className="text-slate-400 hover:text-slate-600">
                                        <X className="h-4 w-4"/>
                                    </button>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.slice(0, 5).map((n: any) => (
                                            <div
                                                key={n.id}
                                                onClick={() => handleNotificationClick(n)}
                                                className={`px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                                            >
                                                <div className="flex items-start gap-2">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-slate-900">{n.title}</p>
                                                        <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                                                        {n.details && n.details.before !== undefined && (
                                                            <p className="text-xs text-slate-400 mt-1">
                                                                {n.details.before} → {n.details.after}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-slate-400 mt-1">{new Date(n.timestamp).toLocaleDateString('de-DE')}</p>
                                                    </div>
                                                    {!n.isRead && (
                                                        <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"/>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-6 text-center text-sm text-slate-500">
                                            Keine Benachrichtigungen
                                        </div>
                                    )}
                                </div>
                                <div className="px-4 py-2 border-t border-slate-100 text-center">
                                    <Link href="/notifications" onClick={() => setShowNotifications(false)}
                                          className="text-xs font-medium text-blue-600 hover:text-blue-500 block w-full">Alle
                                        anzeigen</Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
