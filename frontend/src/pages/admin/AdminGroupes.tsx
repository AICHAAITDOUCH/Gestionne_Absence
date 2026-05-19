import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Trash2, Edit } from 'lucide-react';

const AdminGroupes = () => {
  const queryClient = useQueryClient();
  const [newGroupe, setNewGroupe] = React.useState({ name: '', filiere: '', annee: '' });

  const { data: groupes, isLoading } = useQuery({
    queryKey: ['groupes'],
    queryFn: async () => {
      const { data } = await api.get('/groupes');
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (newG: any) => api.post('/groupes', newG),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupes'] });
      setNewGroupe({ name: '', filiere: '', annee: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/groupes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groupes'] })
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newGroupe);
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Groupes</h1>
          <p className="text-muted-foreground mt-1">Créez et gérez les groupes de l'établissement.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 glass border-none h-fit">
          <CardHeader>
            <CardTitle>Nouveau Groupe</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom</label>
                <Input value={newGroupe.name} onChange={e => setNewGroupe({...newGroupe, name: e.target.value})} required placeholder="DEVOWFS 201" />
              </div>
              <div>
                <label className="text-sm font-medium">Filière</label>
                <Input value={newGroupe.filiere} onChange={e => setNewGroupe({...newGroupe, filiere: e.target.value})} required placeholder="Développement Digital" />
              </div>
              <div>
                <label className="text-sm font-medium">Année</label>
                <Input value={newGroupe.annee} onChange={e => setNewGroupe({...newGroupe, annee: e.target.value})} required placeholder="2ème Année" />
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
                    <th className="px-6 py-4 font-medium">Nom</th>
                    <th className="px-6 py-4 font-medium">Filière</th>
                    <th className="px-6 py-4 font-medium">Année</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {groupes?.map((groupe: any) => (
                    <tr key={groupe.id} className="hover:bg-secondary/20">
                      <td className="px-6 py-4 font-semibold">{groupe.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{groupe.filiere}</td>
                      <td className="px-6 py-4 text-muted-foreground">{groupe.annee}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(groupe.id)}>
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

export default AdminGroupes;
