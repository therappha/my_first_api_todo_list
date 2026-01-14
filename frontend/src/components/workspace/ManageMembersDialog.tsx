import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, UserPlus } from 'lucide-react';
import { mockUsers } from '@/api/mock-data.js';
import { toast } from 'sonner';

interface Member {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
}

interface ManageMembersDialogProps {
  workspaceId: string;
  currentMembers: Member[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMember: (userId: string) => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
}

export function ManageMembersDialog({
  workspaceId,
  currentMembers,
  open,
  onOpenChange,
  onAddMember,
  onRemoveMember,
}: ManageMembersDialogProps) {
  const [searchUsername, setSearchUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [foundUser, setFoundUser] = useState<Member | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSearch = () => {
    // Search in mock users
    const user = mockUsers.find(u => u.username.toLowerCase() === searchUsername.toLowerCase());

    if (user) {
      // Check if already a member
      if (currentMembers.some(m => m.id === user.id)) {
        toast.error('This user is already a member');
        setFoundUser(null);
      } else {
        setFoundUser(user as Member);
      }
    } else {
      toast.error('User not found');
      setFoundUser(null);
    }
  };

  const handleAddMember = async () => {
    if (!foundUser) return;

    setIsLoading(true);
    await onAddMember(foundUser.id);
    setFoundUser(null);
    setSearchUsername('');
    setIsLoading(false);
  };

  const handleRemoveMember = async (userId: string) => {
    setIsLoading(true);
    await onRemoveMember(userId);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Members</DialogTitle>
          <DialogDescription>
            Add or remove members from this workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Add member section */}
          <div className="space-y-3">
            <Label>Add Member by Username</Label>
            <div className="flex gap-2">
              <Input
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                placeholder="Enter username"
                type="text"
              />
              <Button onClick={handleSearch} variant="secondary">
                Search
              </Button>
            </div>

            {foundUser && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg animate-fade-in">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={foundUser.avatar || undefined} alt={foundUser.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(foundUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{foundUser.name}</p>
                    <p className="text-xs text-muted-foreground">@{foundUser.username}</p>
                  </div>
                </div>
                <Button onClick={handleAddMember} size="sm" disabled={isLoading}>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Demo users: janedoe, bobsmith
            </p>
          </div>

          {/* Current members */}
          <div className="space-y-3">
            <Label>Current Members ({currentMembers.length})</Label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {currentMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-card border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar || undefined} alt={member.name} />
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">@{member.username}</p>
                    </div>
                  </div>
                  {currentMembers.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
