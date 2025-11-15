import { BadgeInfoIcon, Home, LogInIcon, LogOut, Settings } from "lucide-react"
import { Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Link, useNavigate } from "react-router"
import { useUserContext } from "@/providers/UserProvider"
import config from "@/configs/config.json"

const sidebarLinks = [
  {
    title: "Dashboard",
    url: "app/dashboard",
    icon: Home,
    role: "user"
  },
  {
    title: "Events",
    url: "app/events",
    icon: BadgeInfoIcon,
    role: "user"
  },
  {
    title: "Dashboard",
    url: "admin/dashboard",
    icon: Home,
    role: "admin"
  },
  {
    title: "Login",
    url: "login",
    icon: LogInIcon,
    role: ""
  },
]

export default function AppSidebar() {
  const {user, logout} = useUserContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/auth/logout`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Clear user state and all polling intervals
        logout();
        // Navigate to login page after successful logout
        navigate('/login');
      } else {
        console.error('Logout failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <Sidebar className="sidebar">
      <SidebarHeader>Black Relay</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarLinks.map((item) => {
                if(user.role == item.role) return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )})}
              
              {/* Show logout button for authenticated users */}
              {user.role && user.role !== "" && (
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleLogout}>
                    <LogOut />
                    <span>Logout</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}