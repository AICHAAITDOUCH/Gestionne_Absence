import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Trash2 } from 'lucide-react';

const AdminModules = () => {
  const queryClient = useQueryClient();
  const [newModule, setNewModule] = React.useState({ name: '', code: '', volume_horaire: '' });

  const { data: modules, isLoading } = useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const { data } = await api.get('/modules');
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (newM: any) => api.post('/modules', newM),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      setNewModule({ name: '', code: '', volume_horaire: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/modules/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['modules'] })
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newModule);
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Modules</h1>
          <p className="text-muted-foreground mt-1">Créez et gérez les modules enseignés.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 glass border-none h-fit">
          <CardHeader>
            <CardTitle>Nouveau Module</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom du module</label>
                <Input value={newModule.name} onChange={e => setNewModule({...newModule, name: e.target.value})} required placeholder="Développement Front-end" />
              </div>
              <div>
                <label className="text-sm font-medium">Code</label>
                <Input value={newModule.code} onChange={e => setNewModule({...newModule, code: e.target.value})} required placeholder="M201" />
              </div>
              <div>
                <label className="text-sm font-medium">Volume Horaire</label>
                <Input type="number" value={newModule.volume_horaire} onChange={e => setNewModule({...newModule, volume_horaire: e.target.value})} required placeholder="120" />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                <Plus className="w-4 h-4 mr-2" /> Ajouter
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 glass border-none">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">Code</th>
                    <th className="px-6 py-4 font-medium">Nom</th>
                    <th className="px-6 py-4 font-medium">Volume Horaire</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {modules?.map((mod: any) => (
                    <tr key={mod.id} className="hover:bg-secondary/20">
                      <td className="px-6 py-4 font-semibold">{mod.code}</td>
                      <td className="px-6 py-4 text-muted-foreground">{mod.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{mod.volume_horaire}h</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(mod.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminModules;
