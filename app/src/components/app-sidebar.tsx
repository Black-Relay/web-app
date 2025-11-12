import { BadgeInfoIcon, Home, LogInIcon, Settings } from "lucide-react"
import { Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Link } from "react-router"
import { useUserContext } from "@/providers/UserProvider"

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
  const {user} = useUserContext();

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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}