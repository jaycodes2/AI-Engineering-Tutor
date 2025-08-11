import React, { useState, useEffect } from 'react';
import { 
    BrainCircuitIcon, 
    UserCircleIcon, 
    LogoutIcon, 
    SunIcon, 
    MoonIcon,
    AstronautIcon,
    GearIcon,
    BookIcon,
    SimpleLightBulbIcon
} from './icons.jsx';
import { Page } from '../constants.js';

const avatarComponents = {
    UserCircle: UserCircleIcon,
    Astronaut: AstronautIcon,
    Gear: GearIcon,
    Book: BookIcon,
    LightBulb: SimpleLightBulbIcon,
};

const ThemeSwitcher = ({ theme, setTheme }) => {
    const themes = [
        { name: 'Light', value: 'light' },
        { name: 'Dark', value: 'dark' },
        { name: 'System', value: 'system' }
    ];

    return (
        <div className="flex items-center p-1 rounded-md bg-secondary">
            {themes.map(t => (
                <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`px-2 py-1 text-xs font-medium rounded-sm transition-colors ${
                        theme === t.value
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                >
                    {t.name}
                </button>
            ))}
        </div>
    );
};


const Navbar = ({ user, currentPage, onNavigate, onLogout, theme, setTheme }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navItems = [
    { page: Page.Chat, label: 'Chat' },
    { page: Page.Dashboard, label: 'Learn' },
    { page: Page.Performance, label: 'Performance' },
  ];

  const AvatarIcon = avatarComponents[user.avatar] || UserCircleIcon;

  return (
    <nav className="bg-background/80 backdrop-blur-sm border-b border-border px-4 lg:px-6 py-2 sticky top-0 z-30">
      <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
        <div onClick={() => onNavigate(Page.Chat)} className="flex items-center cursor-pointer group">
          <BrainCircuitIcon className="w-8 h-8 text-blue-500 mr-3 transition-transform group-hover:rotate-6" />
          <span className="self-center text-xl font-bold whitespace-nowrap text-foreground">AI Tutor</span>
        </div>
        <div className="flex items-center lg:order-2">
            <div className="relative">
                <button onClick={() => setDropdownOpen(!dropdownOpen)} onBlur={() => setTimeout(() => setDropdownOpen(false), 200)} className="flex items-center text-foreground focus:outline-none p-1 rounded-full hover:bg-secondary">
                    <span className="mr-2 hidden sm:inline text-sm font-medium">{user.name}</span>
                    <AvatarIcon className="w-7 h-7"/>
                </button>
                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-popover rounded-md shadow-lg py-2 border border-border z-50 animate-slide-up-fade">
                        <div className="px-3 py-2 flex items-center gap-3">
                            <AvatarIcon className="w-10 h-10 text-muted-foreground" />
                             <div>
                                <p className="text-sm font-semibold text-foreground">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                        </div>
                         <div className="border-t border-border my-2"></div>
                         <div className="px-3 py-2">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Theme</p>
                            <ThemeSwitcher theme={theme} setTheme={setTheme} />
                        </div>
                        <div className="border-t border-border my-2"></div>
                        <a onClick={() => { onNavigate(Page.Profile); setDropdownOpen(false); }} className="block px-3 py-2 text-sm text-foreground hover:bg-secondary cursor-pointer">Profile</a>
                        <a onClick={onLogout} className="flex items-center px-3 py-2 text-sm text-destructive hover:bg-secondary cursor-pointer w-full">
                           <LogoutIcon className="w-4 h-4 mr-2"/> Logout
                        </a>
                    </div>
                )}
            </div>
        </div>
        <div className="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1" id="mobile-menu-2">
          <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-2 lg:mt-0">
            {navItems.map(item => (
              <li key={item.page}>
                <button onClick={() => onNavigate(item.page)} 
                   className={`block py-2 px-3 rounded-md cursor-pointer transition-colors font-semibold text-sm ${currentPage === item.page ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;