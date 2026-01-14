import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Users, FolderKanban } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Member {
  id: string;
  name: string;
  avatar: string | null;
}

interface WorkspaceCardProps {
  id: string;
  name: string;
  description: string;
  members?: Member[];
  projectCount?: number;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function WorkspaceCard({
  name,
  description,
  members = [],
  projectCount = 0,
  onClick,
  onEdit,
  onDelete,
}: WorkspaceCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:card-shadow-hover card-shadow animate-fade-in"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl group-hover:text-primary transition-colors">
              {name}
            </CardTitle>
            <CardDescription className="line-clamp-2">{description}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                Edit Workspace
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-destructive focus:text-destructive"
              >
                Delete Workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <FolderKanban className="h-4 w-4" />
              <span>{projectCount} projects</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{members?.length || 0} members</span>
            </div>
          </div>

          <div className="flex -space-x-2">
            {members && members.length > 0 ? (
              members.slice(0, 4).map((member) => (
                <Avatar key={member.id} className="h-8 w-8 border-2 border-card">
                  <AvatarImage src={member.avatar || undefined} alt={member.name} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
              ))
            ) : (
              <div className="h-8 w-8 border-2 border-card rounded-full bg-muted flex items-center justify-center">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            {members && members.length > 4 && (
              <div className="h-8 w-8 border-2 border-card rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                +{members.length - 4}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
