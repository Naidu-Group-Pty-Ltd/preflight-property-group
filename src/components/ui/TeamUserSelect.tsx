import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTeamUsers } from '@/hooks/useTeamUsers';
import { UserCircle } from 'lucide-react';

interface TeamUserSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  allowUnassigned?: boolean;
}

export function TeamUserSelect({
  value,
  onValueChange,
  placeholder = 'Assign to...',
  className,
  allowUnassigned = true,
}: TeamUserSelectProps) {
  const { data: users = [], isLoading } = useTeamUsers();

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <div className="flex items-center gap-2">
          <UserCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <SelectValue placeholder={isLoading ? 'Loading...' : placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {allowUnassigned && (
          <SelectItem value="unassigned">
            <span className="text-muted-foreground">Unassigned</span>
          </SelectItem>
        )}
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            <div className="flex flex-col">
              <span>{user.username}</span>
              {user.email && <span className="text-xs text-muted-foreground">{user.email}</span>}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
