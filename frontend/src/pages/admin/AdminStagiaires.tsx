import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Trash2, Edit, Search } from 'lucide-react';

const AdminStagiaires = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', phone: '', groupe_id: '' });

  const { data: stagiaires, isLoading } = useQuery({
    queryKey: ['stagiaires'],
    queryFn: async () => (await api.get('/stagiaires')).data
  });

  const { data: groupes } = useQuery({
    queryKey: ['groupes'],
    queryFn: async () => (await api.get('/groupes')).data
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/stagiaires', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stagiaires'] });
      setNewUser({ name: '', email: '', password: '', phone: '', groupe_id: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/stagiaires/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['stagiaires'] })
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newUser);
  };

  const filtered = stagiaires?.filter((s: any) => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Chargement des stagiaires...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Stagiaires</h1>
          <p className="text-muted-foreground mt-1">Créez et gérez les comptes étudiants.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-1 glass border-none h-fit">
          <CardHeader>
            <CardTitle>Ajouter un stagiaire</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom complet</label>
                <Input value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required placeholder="John Doe" />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required placeholder="john@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium">Mot de passe</label>
                <Input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required placeholder="••••••" minLength={6} />
              </div>
              <div>
                <label className="text-sm font-medium">Téléphone</label>
                <Input value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} placeholder="0600000000" />
              </div>
              <div>
                <label className="text-sm font-medium">Groupe</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  value={newUser.groupe_id} onChange={e => setNewUser({...newUser, groupe_id: e.target.value})} required
                >
                  <option value="">Sélectionner un groupe</option>
                  {groupes?.map((g: any) => <option key={g.id} value={g.id}>{g.name} - {g.filiere}</option>)}
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                <Plus className="w-4 h-4 mr-2" /> Ajouter
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2 glass border-none overflow-hidden flex flex-col h-full min-h-[500px]">
          <div className="p-4 border-b flex items-center justify-between gap-4 bg-card/50">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher par nom ou email..." 
                className="pl-9 bg-background/50"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="text-sm text-muted-foreground font-medium">{filtered.length} stagiaire(s)</span>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/80 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 font-medium">Stagiaire</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Groupe</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((user: any) => (
                  <tr key={user.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                          {user.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">{user.email}</span>
                        <span className="text-xs text-muted-foreground/70">{user.phone || 'Non renseigné'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {user.groupe?.name || 'Aucun'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => {
                        if(confirm('Êtes-vous sûr de vouloir supprimer ce stagiaire ?')) deleteMutation.mutate(user.id);
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      Aucun stagiaire trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminStagiaires;
