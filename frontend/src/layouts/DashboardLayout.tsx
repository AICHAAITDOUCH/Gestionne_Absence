import React, { useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, BookOpen, Calendar, FileText, LogOut, Settings, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarLink = ({ to, icon: Icon, children, active }: { to: string, icon: any, children: React.ReactNode, active: boolean }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
      active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
    )}
  >
    {active && (
      <motion.div
        layoutId="active-nav"
        className="absolute left-0 w-1 h-full bg-primary rounded-r-full"
        initial={false}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
    <Icon className={cn("w-5 h-5", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
    <span>{children}</span>
  </Link>
);

const DashboardLayout = () => {
  const { user, logout, fetchUser, isLoading } = useAuthStore();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background">Chargement...</div>;

  if (!user) return <Navigate to="/login" replace />;

  const adminLinks = [
    { to: "/admin", icon: LayoutDashboard, label: "Tableau de bord" },
    { to: "/admin/stagiaires", icon: Users, label: "Stagiaires" },
    { to: "/admin/formateurs", icon: Users, label: "Formateurs" },
    { to: "/admin/groupes", icon: BookOpen, label: "Groupes" },
    { to: "/admin/modules", icon: FileText, label: "Modules" },
    { to: "/admin/seances", icon: Calendar, label: "Séances" },
    { to: "/admin/justifications", icon: FileText, label: "Justifications" },
  ];

  const formateurLinks = [
    { to: "/formateur", icon: LayoutDashboard, label: "Tableau de bord" },
    { to: "/formateur/seances", icon: Calendar, label: "Mes Séances" },
  ];

  const stagiaireLinks = [
    { to: "/stagiaire", icon: LayoutDashboard, label: "Tableau de bord" },
    { to: "/stagiaire/absences", icon: FileText, label: "Mes Absences" },
  ];

  const links = user.role === 'admin' ? adminLinks : user.role === 'formateur' ? formateurLinks : stagiaireLinks;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card border-r shadow-sm">
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold">SA</div>
        <span className="text-xl font-bold tracking-tight">SmartAbsence</span>
      </div>
      
      <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Menu Principal
      </div>
      
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <SidebarLink key={link.to} to={link.to} icon={link.icon} active={location.pathname === link.to || location.pathname.startsWith(link.to + '/')}>
            {link.label}
          </SidebarLink>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-secondary/50 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {user.name.charAt(0)}
          </div>
          <div className="flex-col flex overflow-hidden">
            <span className="text-sm font-semibold truncate">{user.name}</span>
            <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 h-full z-10">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm border-b z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-semibold capitalize hidden sm:block">Espace {user.role}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Settings className="w-4 h-4 mr-2" /> Paramètres
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 bg-secondary/20">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
