import React, { useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  src?: string | null;
  name: string;
  onUpload: (file: File) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-10 w-10',
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
};

const iconSizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function AvatarUpload({ src, name, onUpload, size = 'md', className }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className={cn('relative group cursor-pointer', className)} onClick={handleClick}>
      <Avatar className={cn(sizeClasses[size], 'ring-2 ring-background')}>
        <AvatarImage src={src || undefined} alt={name} />
        <AvatarFallback className="bg-primary text-primary-foreground font-medium">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className={cn(
        'absolute inset-0 flex items-center justify-center rounded-full',
        'bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity'
      )}>
        <Camera className={cn(iconSizeClasses[size], 'text-background')} />
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
