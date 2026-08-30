import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Palette, Trash2, Edit, Upload, Star, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { logActivityDirect } from '@/hooks/useActivityLogger';
import { secureStorageUpload } from '@/hooks/useSecureStorage';

interface BrandingProfile {
  id: string;
  client_name: string;
  logo_path: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  font_family: string | null;
  is_default: boolean | null;
  is_active: boolean | null;
  created_at: string | null;
}

interface BrandingManagerProps {
  profiles: BrandingProfile[];
  isLoading: boolean;
}

export function BrandingManager({ profiles, isLoading }: BrandingManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<BrandingProfile | null>(null);
  const [formData, setFormData] = useState({
    client_name: '',
    primary_color: '#1e40af',
    secondary_color: '#64748b',
    accent_color: '#f59e0b',
    font_family: 'Inter',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      client_name: '',
      primary_color: '#1e40af',
      secondary_color: '#64748b',
      accent_color: '#f59e0b',
      font_family: 'Inter',
    });
    setLogoFile(null);
    setEditingProfile(null);
  };

  const handleOpenDialog = (profile?: BrandingProfile) => {
    if (profile) {
      setEditingProfile(profile);
      setFormData({
        client_name: profile.client_name,
        primary_color: profile.primary_color || '#1e40af',
        secondary_color: profile.secondary_color || '#64748b',
        accent_color: profile.accent_color || '#f59e0b',
        font_family: profile.font_family || 'Inter',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.client_name) {
      toast({
        title: 'Client name required',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      let logoPath = editingProfile?.logo_path || null;

      // Upload logo if provided - use secure storage
      if (logoFile) {
        const filePath = `client-branding/${Date.now()}-${logoFile.name}`;
        const uploadResult = await secureStorageUpload('report-templates', filePath, logoFile, {
          contentType: logoFile.type
        });

        if (!uploadResult.success) throw new Error(uploadResult.error || 'Logo upload failed');
        logoPath = uploadResult.path || filePath;
      }

      const profileData = {
        client_name: formData.client_name,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        accent_color: formData.accent_color,
        font_family: formData.font_family,
        logo_path: logoPath,
        is_active: true,
      };

      if (editingProfile) {
        const { error } = await supabase
          .from('client_branding_profiles')
          .update({ ...profileData, updated_at: new Date().toISOString() })
          .eq('id', editingProfile.id);

        if (error) throw error;
        toast({ title: 'Branding profile updated' });
        
        logActivityDirect({
          actionType: 'branding_profile_updated',
          entityType: 'branding_profile',
          entityId: editingProfile.id,
          entityName: formData.client_name,
        });
      } else {
        const { data: newProfile, error } = await supabase
          .from('client_branding_profiles')
          .insert(profileData)
          .select('id')
          .single();

        if (error) throw error;
        toast({ title: 'Branding profile created' });
        
        logActivityDirect({
          actionType: 'branding_profile_created',
          entityType: 'branding_profile',
          entityId: newProfile?.id,
          entityName: formData.client_name,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['client-branding-profiles'] });
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Save failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (profile: BrandingProfile) => {
      if (profile.logo_path) {
        await supabase.storage
          .from('report-templates')
          .remove([profile.logo_path]);
      }

      const { error } = await supabase
        .from('client_branding_profiles')
        .delete()
        .eq('id', profile.id);

      if (error) throw error;
      return profile;
    },
    onSuccess: (profile) => {
      queryClient.invalidateQueries({ queryKey: ['client-branding-profiles'] });
      toast({ title: 'Profile deleted' });
      
      logActivityDirect({
        actionType: 'branding_profile_deleted',
        entityType: 'branding_profile',
        entityId: profile.id,
        entityName: profile.client_name,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (profileId: string) => {
      // Clear existing default
      await supabase
        .from('client_branding_profiles')
        .update({ is_default: false })
        .neq('id', profileId);

      // Set new default
      const { error } = await supabase
        .from('client_branding_profiles')
        .update({ is_default: true })
        .eq('id', profileId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-branding-profiles'] });
      toast({ title: 'Default profile updated' });
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Branding Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingProfile ? 'Edit Branding Profile' : 'New Branding Profile'}
              </DialogTitle>
              <DialogDescription>
                Configure client-specific branding for reports
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="client_name">Client Name *</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  placeholder="e.g., ABC Property Group"
                />
              </div>

              <div className="space-y-2">
                <Label>Logo</Label>
                <Input
                  type="file"
                  accept=".png,.jpg,.jpeg,.svg"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Primary</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="primary_color"
                      value={formData.primary_color}
                      onChange={(e) =>
                        setFormData({ ...formData, primary_color: e.target.value })
                      }
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Secondary</Label>
                  <Input
                    type="color"
                    id="secondary_color"
                    value={formData.secondary_color}
                    onChange={(e) =>
                      setFormData({ ...formData, secondary_color: e.target.value })
                    }
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accent_color">Accent</Label>
                  <Input
                    type="color"
                    id="accent_color"
                    value={formData.accent_color}
                    onChange={(e) =>
                      setFormData({ ...formData, accent_color: e.target.value })
                    }
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="font_family">Font Family</Label>
                <Input
                  id="font_family"
                  value={formData.font_family}
                  onChange={(e) => setFormData({ ...formData, font_family: e.target.value })}
                  placeholder="Inter, Roboto, etc."
                />
              </div>

              {/* Preview */}
              <div className="p-4 rounded-lg border space-y-2">
                <p className="text-xs text-muted-foreground">Preview</p>
                <div className="flex gap-2">
                  <div
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: formData.primary_color }}
                  />
                  <div
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: formData.secondary_color }}
                  />
                  <div
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: formData.accent_color }}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {profiles.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No branding profiles yet</p>
          <p className="text-sm">Create a profile to customize report branding</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <Card key={profile.id} className="relative">
              {profile.is_default && (
                <Badge className="absolute top-2 right-2 bg-brand-500">
                  <Star className="h-3 w-3 mr-1" />
                  Default
                </Badge>
              )}
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  {profile.logo_path ? (
                    <img
                      src={`${supabase.storage.from('report-templates').getPublicUrl(profile.logo_path).data.publicUrl}`}
                      alt={profile.client_name}
                      className="h-10 w-10 object-contain rounded"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                      <Palette className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{profile.client_name}</p>
                    <p className="text-xs text-muted-foreground">{profile.font_family}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: profile.primary_color || '#1e40af' }}
                    title="Primary"
                  />
                  <div
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: profile.secondary_color || '#64748b' }}
                    title="Secondary"
                  />
                  <div
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: profile.accent_color || '#f59e0b' }}
                    title="Accent"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(profile)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDefaultMutation.mutate(profile.id)}
                      disabled={profile.is_default || false}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Profile</AlertDialogTitle>
                          <AlertDialogDescription>
                            Delete "{profile.client_name}" branding profile?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(profile)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
