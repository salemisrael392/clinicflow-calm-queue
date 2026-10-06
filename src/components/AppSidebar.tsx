import { Activity, CalendarDays, Users, Clock, LayoutDashboard, Stethoscope, ListOrdered, LogOut, CalendarClock } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const patientItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "My Appointments", url: "/appointments", icon: CalendarDays },
  { title: "Queue Status", url: "/queue", icon: Clock },
];

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Doctors", url: "/admin/doctors", icon: Stethoscope },
  { title: "Schedules", url: "/admin/schedules", icon: CalendarClock },
  { title: "Queue Control", url: "/admin/queue", icon: ListOrdered },
  { title: "All Appointments", url: "/admin/appointments", icon: CalendarDays },
];

const doctorItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "My Profile", url: "/admin/doctors", icon: Stethoscope },
  { title: "My Schedule", url: "/admin/schedules", icon: CalendarClock },
  { title: "My Queue", url: "/admin/queue", icon: ListOrdered },
  { title: "My Appointments", url: "/admin/appointments", icon: CalendarDays },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { role, signOut, user } = useAuth();
  const location = useLocation();

  const items = role === "admin" ? adminItems : role === "doctor" ? doctorItems : patientItems;
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border/70">
        <div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center shrink-0 shadow-sm">
          <Activity className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && <span className="font-display text-2xl text-foreground">Clinic Flow</span>}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{role === "admin" ? "Administration" : "Patient Menu"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent/60"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <div className="text-xs text-muted-foreground truncate mb-2 px-2">
            {user?.email}
          </div>
        )}
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          {!collapsed && "Sign Out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
