import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  BarChart3,
  Building,
  Database,
  DollarSign,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function SideBar() {
  return (
    <div className="flex h-full flex-col">
      <nav className="grid gap-1 px-2">
        {[
          {
            icon: <LayoutDashboard className="h-4 w-4" />,
            name: 'Dashboard',
            path: '/admin/home', // Define the route path
            active: true, // Default active for Dashboard
          },
          {
            icon: <Users className="h-4 w-4" />,
            name: 'Students',
            path: '/admin/userList',
          },
          {
            icon: <Layers className="h-4 w-4" />,
            name: 'Courses',
            path: '/admin/courses',
          },
          {
            icon: <Building className="h-4 w-4" />,
            name: 'Tutors',
            path: '/admin/tutorList',
          },
          {
            icon: <DollarSign className="h-4 w-4" />,
            name: 'Finances',
            path: '/finances',
          },
          {
            icon: <BarChart3 className="h-4 w-4" />,
            name: 'Analytics',
            path: '/analytics',
          },
          {
            icon: <MessageSquare className="h-4 w-4" />,
            name: 'Support Tickets',
            path: '/support',
          },
          {
            icon: <Database className="h-4 w-4" />,
            name: 'Content Management',
            path: '/content',
          },
          {
            icon: <AlertCircle className="h-4 w-4" />,
            name: 'Reports & Issues',
            path: '/reports',
          },
        ].map((item) => (
          <Button
            key={item.name}
            variant={item.active ? 'secondary' : 'ghost'}
            className="justify-start"
            asChild // Use asChild to wrap Link
          >
            <Link to={item.path}>
              {item.icon}
              <span className="ml-2">{item.name}</span>
            </Link>
          </Button>
        ))}
      </nav>
      <div className="mt-auto border-t px-4 py-4">
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="mr-2 h-4 w-4" />
          Platform Settings
        </Button>
      </div>
    </div>
  );
}
