import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Trash2 } from 'lucide-react';
import moment from 'moment';

const AdminSeances = () => {
  const queryClient = useQueryClient();
  const [newSeance, setNewSeance] = React.useState({
    module_id: '',
    groupe_id: '',
    formateur_id: '',
    date: '',
    heure_debut: '',
    heure_fin: '',
    type: 'cours'
  });

  const { data: seances, isLoading } = useQuery({
    queryKey: ['seances'],
    queryFn: async () => {
      const { data } = await api.get('/seances');
      return data;
    }
  });

  const { data: modules } = useQuery({ queryKey: ['modules'], queryFn: async () => (await api.get('/modules')).data });
  const { data: groupes } = useQuery({ queryKey: ['groupes'], queryFn: async () => (await api.get('/groupes')).data });
  // Need to fetch formateurs only, but for now we'll fetch all users?
  // We can add a simple route for formateurs, but assuming we can get them from seances or similar.

  const createMutation = useMutation({
    mutationFn: (newS: any) => api.post('/seances', newS),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seances'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/seances/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seances'] })
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newSeance);
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Séances</h1>
          <p className="text-muted-foreground mt-1">Planifiez les séances de cours.</p>
        </div>
      </div>

      <Card className="glass border-none h-fit">
        <CardHeader>
          <CardTitle>Nouvelle Séance</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm font-medium">Module</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                value={newSeance.module_id} onChange={e => setNewSeance({...newSeance, module_id: e.target.value})} required
              >
                <option value="">Sélectionner...</option>
                {modules?.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Groupe</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                value={newSeance.groupe_id} onChange={e => setNewSeance({...newSeance, groupe_id: e.target.value})} required
              >
                <option value="">Sélectionner...</option>
                {groupes?.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={newSeance.date} onChange={e => setNewSeance({...newSeance, date: e.target.value})} required />
            </div>
            <div className="flex space-x-2">
              <div className="w-1/2">
                <label className="text-sm font-medium">Début</label>
                <Input type="time" value={newSeance.heure_debut} onChange={e => setNewSeance({...newSeance, heure_debut: e.target.value})} required />
              </div>
              <div className="w-1/2">
                <label className="text-sm font-medium">Fin</label>
                <Input type="time" value={newSeance.heure_fin} onChange={e => setNewSeance({...newSeance, heure_fin: e.target.value})} required />
              </div>
            </div>
            {/* Note: In a real app we'd fetch the Formateurs dropdown as well */}
            <div>
              <label className="text-sm font-medium">ID Formateur (temp)</label>
              <Input type="number" value={newSeance.formateur_id} onChange={e => setNewSeance({...newSeance, formateur_id: e.target.value})} required />
            </div>
            <div className="md:col-span-3">
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                <Plus className="w-4 h-4 mr-2" /> Planifier la séance
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="glass border-none">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Horaire</th>
                  <th className="px-6 py-4 font-medium">Module</th>
                  <th className="px-6 py-4 font-medium">Groupe</th>
                  <th className="px-6 py-4 font-medium">Formateur</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {seances?.map((seance: any) => (
                  <tr key={seance.id} className="hover:bg-secondary/20">
                    <td className="px-6 py-4 font-semibold">{moment(seance.date).format('DD/MM/YYYY')}</td>
                    <td className="px-6 py-4 text-muted-foreground">{seance.heure_debut} - {seance.heure_fin}</td>
                    <td className="px-6 py-4 text-muted-foreground">{seance.module?.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{seance.groupe?.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{seance.formateur?.name}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(seance.id)}>
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
  );
};

export default AdminSeances;
