import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { PermissionPresets } from './PermissionPresets';

interface Module {
  id: string;
  module_key: string;
  module_name: string;
  description: string;
  category: string;
}

interface PermissionSetting {
  module_key: string;
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface PermissionsGridProps {
  modules: Module[];
  permissions: PermissionSetting[];
  onUpdate: (moduleKey: string, field: 'can_view' | 'can_edit' | 'can_delete', value: boolean) => void;
  onApplyPreset?: (permissions: PermissionSetting[]) => void;
  showPresets?: boolean;
}

export function PermissionsGrid({ modules, permissions, onUpdate, onApplyPreset, showPresets = true }: PermissionsGridProps) {
  const groupedModules = modules.reduce((acc, m) => {
    if (!acc[m.category]) acc[m.category] = [];
    acc[m.category].push(m);
    return acc;
  }, {} as Record<string, Module[]>);

  return (
    <div className="space-y-3">
      {showPresets && onApplyPreset && (
        <PermissionPresets modules={modules} onApply={onApplyPreset} />
      )}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Module</TableHead>
              <TableHead className="w-20 text-center">View</TableHead>
              <TableHead className="w-20 text-center">Edit</TableHead>
              <TableHead className="w-20 text-center">Delete</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(groupedModules).map(([category, mods]) => (
              <React.Fragment key={category}>
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={4} className="font-semibold capitalize">
                    {category}
                  </TableCell>
                </TableRow>
                {mods.map((m) => {
                  const perm = permissions.find(p => p.module_key === m.module_key);
                  return (
                    <TableRow key={m.module_key}>
                      <TableCell>{m.module_name}</TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={perm?.can_view || false}
                          onCheckedChange={(v) => onUpdate(m.module_key, 'can_view', !!v)}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={perm?.can_edit || false}
                          onCheckedChange={(v) => onUpdate(m.module_key, 'can_edit', !!v)}
                          disabled={!perm?.can_view}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={perm?.can_delete || false}
                          onCheckedChange={(v) => onUpdate(m.module_key, 'can_delete', !!v)}
                          disabled={!perm?.can_view}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
