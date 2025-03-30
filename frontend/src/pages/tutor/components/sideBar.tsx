import { Button } from '@/components/ui/button';
import { BarChart3, Calendar, FileText, HelpCircle, LayoutDashboard, MessageSquare, Plus, Settings, Users, Video } from 'lucide-react';


import React from 'react';

export  function SideBar({sidebarOpen}) {
  return (
    <aside
      className={`${
        sidebarOpen ? 'block' : 'hidden'
      } fixed inset-y-0 left-0 top-16 z-30 w-64 shrink-0 border-r bg-background pt-4 md:block`}
    >
      <div className="flex h-full flex-col">
        <div className="px-4">
          <Button className="w-full justify-start gap-2">
            <Plus className="h-4 w-4" />
            Create New Course
          </Button>
        </div>
        <nav className="mt-6 grid gap-1 px-2">
          {[
            {
              icon: <LayoutDashboard className="h-4 w-4" />,
              name: 'Dashboard',
              active: true,
            },
            { icon: <FileText className="h-4 w-4" />, name: 'My Courses' },
            {
              icon: <Video className="h-4 w-4" />,
              name: 'Content Creation',
            },
            { icon: <Users className="h-4 w-4" />, name: 'Students' },
            {
              icon: <MessageSquare className="h-4 w-4" />,
              name: 'Messages',
            },
            { icon: <BarChart3 className="h-4 w-4" />, name: 'Analytics' },
            { icon: <Calendar className="h-4 w-4" />, name: 'Schedule' },
          ].map((item) => (
            <Button
              key={item.name}
              variant={item.active ? 'secondary' : 'ghost'}
              className="justify-start"
            >
              {item.icon}
              <span className="ml-2">{item.name}</span>
            </Button>
          ))}
        </nav>
        <div className="mt-auto border-t px-4 py-4">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <HelpCircle className="mr-2 h-4 w-4" />
            Help & Support
          </Button>
        </div>
      </div>
    </aside>
  );
}
