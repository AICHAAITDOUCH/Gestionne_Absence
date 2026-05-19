import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Trash2, Calendar, BookOpen, Clock, Award, ShieldAlert, Edit, X } from 'lucide-react';
import moment from 'moment';

const AdminSeances = () => {
  const queryClient = useQueryClient();
  
  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form States
  const [newSeance, setNewSeance] = useState({
    module_id: '',
    groupe_id: '',
    formateur_id: '',
    date: '',
    heure_debut: '',
    heure_fin: '',
    type: 'cours'
  });

  const [editSeance, setEditSeance] = useState({
    id: 0,
    module_id: '',
    groupe_id: '',
    formateur_id: '',
    date: '',
    heure_debut: '',
    heure_fin: '',
    type: 'cours'
  });

  // Fetch all modules
  const { data: allModules } = useQuery({ 
    queryKey: ['modules'], 
    queryFn: async () => (await api.get('/modules')).data 
  });

  // Fetch all formateurs
  const { data: formateurs } = useQuery({ 
    queryKey: ['formateurs'], 
    queryFn: async () => (await api.get('/formateurs')).data 
  });

  // Fetch all groups (as a fallback)
  const { data: allGroupes } = useQuery({ 
    queryKey: ['allGroupes'], 
    queryFn: async () => (await api.get('/groupes')).data 
  });

  // NEW SEANCE DEPENDENT QUERIES
  // 1. Fetch groups taught by selected formateur (for creation)
  const { data: addFormateurGroupes, isLoading: loadingAddGroupes } = useQuery({
    queryKey: ['formateurGroupes', newSeance.formateur_id],
    queryFn: async () => {
      if (!newSeance.formateur_id) return [];
      return (await api.get(`/formateurs/${newSeance.formateur_id}/groupes`)).data;
    },
    enabled: !!newSeance.formateur_id
  });

  // 2. Fetch modules taught by selected formateur (for creation)
  const { data: addFormateurModules } = useQuery({
    queryKey: ['formateurModules', newSeance.formateur_id],
    queryFn: async () => {
      if (!newSeance.formateur_id) return [];
      return (await api.get(`/modules?formateur_id=${newSeance.formateur_id}`)).data;
    },
    enabled: !!newSeance.formateur_id
  });

  // EDIT SEANCE DEPENDENT QUERIES
  // 1. Fetch groups taught by selected formateur (for editing)
  const { data: editFormateurGroupes, isLoading: loadingEditGroupes } = useQuery({
    queryKey: ['formateurGroupes', editSeance.formateur_id],
    queryFn: async () => {
      if (!editSeance.formateur_id) return [];
      return (await api.get(`/formateurs/${editSeance.formateur_id}/groupes`)).data;
    },
    enabled: !!editSeance.formateur_id
  });

  // 2. Fetch modules taught by selected formateur (for editing)
  const { data: editFormateurModules } = useQuery({
    queryKey: ['formateurModules', editSeance.formateur_id],
    queryFn: async () => {
      if (!editSeance.formateur_id) return [];
      return (await api.get(`/modules?formateur_id=${editSeance.formateur_id}`)).data;
    },
    enabled: !!editSeance.formateur_id
  });

  // Fetch all séances
  const { data: seances, isLoading } = useQuery({
    queryKey: ['seances'],
    queryFn: async () => (await api.get('/seances')).data
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/seances', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seances'] });
      setNewSeance({
        module_id: '',
        groupe_id: '',
        formateur_id: '',
        date: '',
        heure_debut: '',
        heure_fin: '',
        type: 'cours'
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/seances/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seances'] });
      setIsEditOpen(false);
      setEditSeance({
        id: 0,
        module_id: '',
        groupe_id: '',
        formateur_id: '',
        date: '',
        heure_debut: '',
        heure_fin: '',
        type: 'cours'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/seances/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seances'] })
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newSeance);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(editSeance);
  };

  const handleOpenEdit = (seance: any) => {
    setEditSeance({
      id: seance.id,
      module_id: seance.module_id?.toString() || '',
      groupe_id: seance.groupe_id?.toString() || '',
      formateur_id: seance.formateur_id?.toString() || '',
      date: seance.date || '',
      heure_debut: seance.heure_debut || '',
      heure_fin: seance.heure_fin || '',
      type: seance.type || 'cours'
    });
    setIsEditOpen(true);
  };

  const activeAddGroups = newSeance.formateur_id ? (addFormateurGroupes || []) : (allGroupes || []);
  const activeAddModules = newSeance.formateur_id ? (addFormateurModules || []) : (allModules || []);

  const activeEditGroups = editSeance.formateur_id ? (editFormateurGroupes || []) : (allGroupes || []);
  const activeEditModules = editSeance.formateur_id ? (editFormateurModules || []) : (allModules || []);

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse font-medium">Chargement des séances...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestion des Séances</h1>
          <p className="text-muted-foreground mt-1">Planifiez et affectez les séances de cours par formateur, groupe et module.</p>
        </div>
      </div>

      {/* Planification Form */}
      <Card className="glass border-none h-fit animate-in fade-in duration-200">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Planifier une Séance
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="text-sm font-semibold text-muted-foreground mb-1 block">1. Formateur</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={newSeance.formateur_id} 
                onChange={e => setNewSeance({...newSeance, formateur_id: e.target.value, groupe_id: '', module_id: ''})} 
                required
              >
                <option value="">Sélectionner un formateur...</option>
                {formateurs?.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-muted-foreground mb-1 block">
                2. Groupe {newSeance.formateur_id && <span className="text-[10px] text-primary font-bold">(affecté au formateur)</span>}
              </label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={newSeance.groupe_id} 
                onChange={e => setNewSeance({...newSeance, groupe_id: e.target.value})} 
                required
                disabled={loadingAddGroupes}
              >
                <option value="">
                  {loadingAddGroupes ? 'Chargement des groupes...' : 'Sélectionner un groupe...'}
                </option>
                {activeAddGroups.map((g: any) => (
                  <option key={g.id} value={g.id}>{g.name} - {g.filiere}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-muted-foreground mb-1 block">
                3. Module {newSeance.formateur_id && <span className="text-[10px] text-primary font-bold">(lié au formateur)</span>}
              </label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={newSeance.module_id} 
                onChange={e => setNewSeance({...newSeance, module_id: e.target.value})} 
                required
              >
                <option value="">Sélectionner un module...</option>
                {activeAddModules.map((m: any) => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-muted-foreground mb-1 block">Date de la séance</label>
              <Input type="date" value={newSeance.date} onChange={e => setNewSeance({...newSeance, date: e.target.value})} required className="bg-background/50 border-border/80" />
            </div>

            <div className="flex space-x-3">
              <div className="w-1/2">
                <label className="text-sm font-semibold text-muted-foreground mb-1 block">Heure début</label>
                <Input type="time" value={newSeance.heure_debut} onChange={e => setNewSeance({...newSeance, heure_debut: e.target.value})} required className="bg-background/50 border-border/80" />
              </div>
              <div className="w-1/2">
                <label className="text-sm font-semibold text-muted-foreground mb-1 block">Heure fin</label>
                <Input type="time" value={newSeance.heure_fin} onChange={e => setNewSeance({...newSeance, heure_fin: e.target.value})} required className="bg-background/50 border-border/80" />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-muted-foreground mb-1 block">Type de séance</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={newSeance.type} 
                onChange={e => setNewSeance({...newSeance, type: e.target.value})} 
                required
              >
                <option value="cours">Cours théorique</option>
                <option value="tp">Travaux Pratiques (TP)</option>
                <option value="td">Travaux Dirigés (TD)</option>
                <option value="examen">Contrôle / Examen</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <Button type="submit" disabled={createMutation.isPending} className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                <Plus className="w-4 h-4 mr-2" /> Planifier et Enregistrer la Séance
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Seances list */}
      <Card className="glass border-none overflow-hidden animate-in fade-in duration-300">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/80 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Horaire</th>
                  <th className="px-6 py-4 font-semibold">Module</th>
                  <th className="px-6 py-4 font-semibold">Groupe</th>
                  <th className="px-6 py-4 font-semibold">Formateur</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {seances?.map((seance: any) => (
                  <tr key={seance.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary/70" />
                        {moment(seance.date).format('DD/MM/YYYY')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground/75" />
                        {seance.heure_debut} - {seance.heure_fin}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{seance.module?.name}</span>
                        <span className="text-[10px] text-muted-foreground/70">{seance.module?.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">
                        {seance.groupe?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-semibold">{seance.formateur?.name}</td>
                    <td className="px-6 py-4">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-secondary/80 text-muted-foreground">
                        {seance.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="hover:bg-accent/10 hover:text-accent text-accent" onClick={() => handleOpenEdit(seance)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => {
                          if(confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) deleteMutation.mutate(seance.id);
                        }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {seances?.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      Aucune séance planifiée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-none shadow-2xl glass animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Modifier la Séance
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsEditOpen(false)} className="rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">1. Formateur</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={editSeance.formateur_id} 
                    onChange={e => setEditSeance({...editSeance, formateur_id: e.target.value, groupe_id: '', module_id: ''})} 
                    required
                  >
                    <option value="">Sélectionner un formateur...</option>
                    {formateurs?.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">
                    2. Groupe {editSeance.formateur_id && <span className="text-[10px] text-primary font-bold">(affecté au formateur)</span>}
                  </label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={editSeance.groupe_id} 
                    onChange={e => setEditSeance({...editSeance, groupe_id: e.target.value})} 
                    required
                    disabled={loadingEditGroupes}
                  >
                    <option value="">
                      {loadingEditGroupes ? 'Chargement des groupes...' : 'Sélectionner un groupe...'}
                    </option>
                    {activeEditGroups.map((g: any) => (
                      <option key={g.id} value={g.id}>{g.name} - {g.filiere}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">
                    3. Module {editSeance.formateur_id && <span className="text-[10px] text-primary font-bold">(lié au formateur)</span>}
                  </label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={editSeance.module_id} 
                    onChange={e => setEditSeance({...editSeance, module_id: e.target.value})} 
                    required
                  >
                    <option value="">Sélectionner un module...</option>
                    {activeEditModules.map((m: any) => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Date de la séance</label>
                  <Input type="date" value={editSeance.date} onChange={e => setEditSeance({...editSeance, date: e.target.value})} required className="bg-background/50 border-border/80" />
                </div>

                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="text-sm font-semibold text-muted-foreground mb-1 block">Heure début</label>
                    <Input type="time" value={editSeance.heure_debut} onChange={e => setEditSeance({...editSeance, heure_debut: e.target.value})} required className="bg-background/50 border-border/80" />
                  </div>
                  <div className="w-1/2">
                    <label className="text-sm font-semibold text-muted-foreground mb-1 block">Heure fin</label>
                    <Input type="time" value={editSeance.heure_fin} onChange={e => setEditSeance({...editSeance, heure_fin: e.target.value})} required className="bg-background/50 border-border/80" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Type de séance</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={editSeance.type} 
                    onChange={e => setEditSeance({...editSeance, type: e.target.value})} 
                    required
                  >
                    <option value="cours">Cours théorique</option>
                    <option value="tp">Travaux Pratiques (TP)</option>
                    <option value="td">Travaux Dirigés (TD)</option>
                    <option value="examen">Contrôle / Examen</option>
                  </select>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Annuler</Button>
                  <Button type="submit" disabled={updateMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">Sauvegarder</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminSeances;
