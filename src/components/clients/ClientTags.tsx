import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Plus, X, Tag, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { logActivityDirect } from '@/hooks/useActivityLogger';

interface ClientTagsProps {
  clientId: string;
  compact?: boolean;
}

export function ClientTags({ clientId, compact = false }: ClientTagsProps) {
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  const [showCreate, setShowCreate] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all available tags
  const { data: allTags = [] } = useQuery({
    queryKey: ['client-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_tags')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Fetch client's assigned tags
  const { data: assignedTags = [], isLoading } = useQuery({
    queryKey: ['client-tag-assignments', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_tag_assignments')
        .select('*, client_tags(*)')
        .eq('client_id', clientId);
      if (error) throw error;
      return data;
    }
  });

  // Assign tag mutation
  const assignTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from('client_tag_assignments')
        .insert({ client_id: clientId, tag_id: tagId });
      if (error) throw error;
    },
    onSuccess: (_: any, tagId: string) => {
      queryClient.invalidateQueries({ queryKey: ['client-tag-assignments', clientId] });
      const tagName = allTags.find(t => t.id === tagId)?.name;
      logActivityDirect({
        actionType: 'client_tag_added',
        entityType: 'client',
        entityId: clientId,
        metadata: { tag_name: tagName }
      });
      toast.success('Tag added');
    },
    onError: (error) => {
      toast.error('Failed to add tag: ' + error.message);
    }
  });

  // Remove tag mutation
  const removeTagMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('client_tag_assignments')
        .delete()
        .eq('id', assignmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-tag-assignments', clientId] });
      logActivityDirect({
        actionType: 'client_tag_removed',
        entityType: 'client',
        entityId: clientId,
      });
      toast.success('Tag removed');
    },
    onError: (error) => {
      toast.error('Failed to remove tag: ' + error.message);
    }
  });

  // Create new tag mutation
  const createTagMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('client_tags')
        .insert({ name: newTagName, color: newTagColor })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['client-tags'] });
      setNewTagName('');
      setShowCreate(false);
      // Auto-assign the new tag
      assignTagMutation.mutate(data.id);
    },
    onError: (error) => {
      toast.error('Failed to create tag: ' + error.message);
    }
  });

  const assignedTagIds = assignedTags.map(at => at.tag_id);
  const availableTags = allTags.filter(tag => !assignedTagIds.includes(tag.id));

  const colorPresets = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', 
    '#EC4899', '#6B7280', '#14B8A6', '#F97316', '#6366F1'
  ];

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {isLoading ? (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
          </Badge>
        ) : (
          <>
            {assignedTags.slice(0, 3).map((assignment) => (
              <Badge 
                key={assignment.id}
                style={{ 
                  backgroundColor: `${assignment.client_tags?.color}20`,
                  color: assignment.client_tags?.color,
                  borderColor: `${assignment.client_tags?.color}40`
                }}
                className="text-xs"
              >
                {assignment.client_tags?.name}
              </Badge>
            ))}
            {assignedTags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{assignedTags.length - 3}
              </Badge>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Assigned Tags */}
      <div className="flex flex-wrap gap-2">
        {isLoading ? (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Loading...
          </Badge>
        ) : assignedTags.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tags assigned</p>
        ) : (
          assignedTags.map((assignment) => (
            <Badge 
              key={assignment.id}
              style={{ 
                backgroundColor: `${assignment.client_tags?.color}20`,
                color: assignment.client_tags?.color,
                borderColor: `${assignment.client_tags?.color}40`
              }}
              className="gap-1 pr-1"
            >
              {assignment.client_tags?.name}
              <button
                onClick={() => removeTagMutation.mutate(assignment.id)}
                className="ml-1 hover:bg-black/10 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        )}

        {/* Add Tag Button */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-6 gap-1">
              <Plus className="h-3 w-3" />
              Add Tag
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="start">
            {showCreate ? (
              <div className="p-3 space-y-3">
                <Input
                  placeholder="Tag name..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="h-8"
                />
                <div className="flex flex-wrap gap-1">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewTagColor(color)}
                      className={`w-6 h-6 rounded-full border-2 ${newTagColor === color ? 'border-primary' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => createTagMutation.mutate()}
                    disabled={!newTagName.trim() || createTagMutation.isPending}
                  >
                    {createTagMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      'Create'
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowCreate(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Command>
                <CommandInput placeholder="Search tags..." />
                <CommandList>
                  <CommandEmpty>
                    <div className="py-2">
                      <p className="text-sm text-muted-foreground mb-2">No tags found</p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setShowCreate(true)}
                        className="gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Create new tag
                      </Button>
                    </div>
                  </CommandEmpty>
                  <CommandGroup>
                    {availableTags.map((tag) => (
                      <CommandItem
                        key={tag.id}
                        onSelect={() => {
                          assignTagMutation.mutate(tag.id);
                          setOpen(false);
                        }}
                        className="gap-2"
                      >
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup>
                    <CommandItem 
                      onSelect={() => setShowCreate(true)}
                      className="gap-2"
                    >
                      <Plus className="h-3 w-3" />
                      Create new tag
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
