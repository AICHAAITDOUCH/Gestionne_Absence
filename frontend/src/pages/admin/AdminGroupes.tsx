import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, Trash2, Search, X, Eye, FileText, Download, CheckCircle, GraduationCap, Edit } from 'lucide-react';

const AdminGroupes = () => {
  const queryClient = useQueryClient();
  
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [filiereFilter, setFiliereFilter] = useState('');
  
  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Active Group for Details
  const [activeGroup, setActiveGroup] = useState<any>(null);
  const [groupDetails, setGroupDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Form States
  const [groupeForm, setGroupeForm] = useState({ name: '', filiere: '', annee: '', formateur_ids: [] as number[] });
  const [editGroupeForm, setEditGroupeForm] = useState({ id: 0, name: '', filiere: '', annee: '', formateur_ids: [] as number[] });

  // Fetch formateurs
  const { data: formateurs } = useQuery({
    queryKey: ['formateurs'],
    queryFn: async () => (await api.get('/formateurs')).data
  });

  // Fetch groupes with search + filière filters
  const { data: groupes, isLoading } = useQuery({
    queryKey: ['groupes', searchTerm, filiereFilter],
    queryFn: async () => {
      const { data } = await api.get('/groupes', {
        params: { search: searchTerm, filiere: filiereFilter }
      });
      return data;
    }
  });

  // Extract unique filières for the filter dropdown
  const { data: allGroupesForFiliere } = useQuery({
    queryKey: ['allGroupesRaw'],
    queryFn: async () => (await api.get('/groupes')).data,
    enabled: !filiereFilter
  });
  
  const filieres = React.useMemo(() => {
    const list = allGroupesForFiliere || groupes || [];
    return Array.from(new Set(list.map((g: any) => g.filiere))).filter(Boolean);
  }, [allGroupesForFiliere, groupes]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/groupes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupes'] });
      setIsAddOpen(false);
      setGroupeForm({ name: '', filiere: '', annee: '', formateur_ids: [] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/groupes/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupes'] });
      setIsEditOpen(false);
      setEditGroupeForm({ id: 0, name: '', filiere: '', annee: '', formateur_ids: [] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/groupes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groupes'] })
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(groupeForm);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(editGroupeForm);
  };

  const handleViewDetails = async (groupe: any) => {
    setActiveGroup(groupe);
    setIsDetailOpen(true);
    setLoadingDetails(true);
    try {
      const { data } = await api.get(`/groupes/${groupe.id}`);
      setGroupDetails(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpenEdit = (groupe: any) => {
    setEditGroupeForm({
      id: groupe.id,
      name: groupe.name,
      filiere: groupe.filiere,
      annee: groupe.annee,
      formateur_ids: groupe.formateurs?.map((f: any) => f.id) || []
    });
    setIsEditOpen(true);
  };

  const toggleFormateurSelection = (id: number, isEdit: boolean) => {
    if (isEdit) {
      const selected = editGroupeForm.formateur_ids.includes(id)
        ? editGroupeForm.formateur_ids.filter(fid => fid !== id)
        : [...editGroupeForm.formateur_ids, id];
      setEditGroupeForm({ ...editGroupeForm, formateur_ids: selected });
    } else {
      const selected = groupeForm.formateur_ids.includes(id)
        ? groupeForm.formateur_ids.filter(fid => fid !== id)
        : [...groupeForm.formateur_ids, id];
      setGroupeForm({ ...groupeForm, formateur_ids: selected });
    }
  };

  // EXPORTS
  const exportToExcel = (group: any) => {
    if (!group) return;
    const headers = 'Nom,Email,Telephone\n';
    const rows = group.stagiaires?.map((s: any) => 
      `"${s.name}","${s.email}","${s.phone || ''}"`
    ).join('\n') || '';
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `membres_groupe_${group.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = (group: any) => {
    if (!group) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const stagiairesList = group.stagiaires?.map((s: any, idx: number) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${idx + 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${s.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${s.email}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${s.phone || 'Non renseigné'}</td>
      </tr>
    `).join('') || '<tr><td colspan="4" style="text-align: center; padding: 12px; color: #777;">Aucun stagiaire enregistré</td></tr>';

    const formateursList = group.formateurs?.map((f: any, idx: number) => `
      <div style="padding: 6px 12px; background: #f0f4f8; margin: 4px 0; border-radius: 4px; display: inline-block; font-size: 13px; font-weight: 500; color: #0066A6; margin-right: 8px;">
        ${f.name} (${f.email})
      </div>
    `).join('') || '<span style="color: #777;">Aucun formateur lié</span>';

    printWindow.document.write(`
      <html>
        <head>
          <title>Fiche Groupe - ${group.name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 40px; }
            .header { border-bottom: 3px solid #0066A6; padding-bottom: 15px; margin-bottom: 25px; }
            .title { font-size: 28px; font-weight: bold; color: #0066A6; margin: 0; }
            .subtitle { font-size: 15px; color: #555; margin-top: 5px; }
            .info-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
            .info-card { padding: 12px; background: #f5f5f5; border-radius: 6px; }
            .section-title { font-size: 18px; font-weight: bold; border-left: 4px solid #0088CC; padding-left: 8px; margin-top: 25px; margin-bottom: 12px; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { text-align: left; background: #0066A6; color: white; padding: 8px; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">SmartAbsence - Fiche Groupe</h1>
            <div class="subtitle">Édité le ${new Date().toLocaleDateString()}</div>
          </div>
          <div class="info-grid">
            <div class="info-card">
              <strong>Nom du Groupe :</strong> ${group.name}
            </div>
            <div class="info-card">
              <strong>Année Académique :</strong> ${group.annee}
            </div>
            <div class="info-card" style="grid-column: span 2">
              <strong>Filière / Secteur :</strong> ${group.filiere}
            </div>
          </div>
          
          <div class="section-title">Formateurs affectés</div>
          <div>${formateursList}</div>
          
          <div class="section-title">Liste des Stagiaires (${group.stagiaires?.length || 0})</div>
          <table>
            <thead>
              <tr>
                <th>N°</th>
                <th>Nom complet</th>
                <th>Email</th>
                <th>Téléphone</th>
              </tr>
            </thead>
            <tbody>
              ${stagiairesList}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Chargement des groupes...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestion des Groupes</h1>
          <p className="text-muted-foreground mt-1">Gerez les filières, les classes et affectez les formateurs et les élèves.</p>
        </div>
        <div>
          <Button onClick={() => setIsAddOpen(true)} className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" /> Nouveau Groupe
          </Button>
        </div>
      </div>

      {/* Filters and search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par nom du groupe, filière..." 
            className="pl-9 bg-card border-border/80 focus:border-primary"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select 
            className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={filiereFilter} onChange={e => setFiliereFilter(e.target.value)}
          >
            <option value="">Toutes les filières</option>
            {filieres.map((fil: any) => <option key={fil} value={fil}>{fil}</option>)}
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="glass border-none overflow-hidden flex flex-col h-full min-h-[500px]">
        <div className="p-4 border-b flex items-center justify-between gap-4 bg-card/50">
          <span className="text-sm font-semibold text-foreground">Groupes enregistrés</span>
          <span className="text-sm text-muted-foreground font-medium bg-secondary/50 px-3 py-1 rounded-full">{groupes?.length || 0} groupe(s)</span>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/80 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 font-semibold">Groupe</th>
                <th className="px-6 py-4 font-semibold">Filière / Secteur</th>
                <th className="px-6 py-4 font-semibold">Année scolaire</th>
                <th className="px-6 py-4 font-semibold">Formateurs liés</th>
                <th className="px-6 py-4 font-semibold">Effectif</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {groupes?.map((groupe: any) => (
                <tr key={groupe.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-foreground text-base">{groupe.name}</span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-medium">{groupe.filiere}</td>
                  <td className="px-6 py-4 text-muted-foreground font-medium">{groupe.annee}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {groupe.formateurs && groupe.formateurs.length > 0 ? (
                        groupe.formateurs.map((f: any) => (
                          <span key={f.id} className="inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                            {f.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground/50 italic">Aucun</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                      {groupe.stagiaires_count} stagiaires
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary text-primary" onClick={() => handleViewDetails(groupe)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:bg-accent/10 hover:text-accent text-accent" onClick={() => handleOpenEdit(groupe)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => {
                        if(confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) deleteMutation.mutate(groupe.id);
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {groupes?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Aucun groupe trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-none shadow-2xl glass animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold">Nouveau Groupe</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsAddOpen(false)} className="rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Nom du groupe</label>
                  <Input value={groupeForm.name} onChange={e => setGroupeForm({...groupeForm, name: e.target.value})} required placeholder="DEVOWFS 201" className="bg-background/50 border-border/80" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Filière / Secteur</label>
                  <Input value={groupeForm.filiere} onChange={e => setGroupeForm({...groupeForm, filiere: e.target.value})} required placeholder="Développement Web" className="bg-background/50 border-border/80" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Année Scolaire</label>
                  <Input value={groupeForm.annee} onChange={e => setGroupeForm({...groupeForm, annee: e.target.value})} required placeholder="2025/2026" className="bg-background/50 border-border/80" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-2 block">Affecter des Formateurs</label>
                  <div className="border border-border/80 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2 bg-background/30">
                    {formateurs?.map((f: any) => (
                      <label key={f.id} className="flex items-center gap-2 cursor-pointer hover:bg-secondary/40 p-1 rounded transition-colors">
                        <input 
                          type="checkbox"
                          checked={groupeForm.formateur_ids.includes(f.id)}
                          onChange={() => toggleFormateurSelection(f.id, false)}
                          className="rounded text-primary focus:ring-primary w-4 h-4"
                        />
                        <span className="text-sm font-medium text-foreground">{f.name}</span>
                      </label>
                    ))}
                    {(!formateurs || formateurs.length === 0) && (
                      <span className="text-xs text-muted-foreground italic">Aucun formateur enregistré.</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Annuler</Button>
                  <Button type="submit" disabled={createMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">Créer</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-none shadow-2xl glass animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold">Modifier le Groupe</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsEditOpen(false)} className="rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Nom du groupe</label>
                  <Input value={editGroupeForm.name} onChange={e => setEditGroupeForm({...editGroupeForm, name: e.target.value})} required className="bg-background/50 border-border/80" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Filière / Secteur</label>
                  <Input value={editGroupeForm.filiere} onChange={e => setEditGroupeForm({...editGroupeForm, filiere: e.target.value})} required className="bg-background/50 border-border/80" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-1 block">Année Scolaire</label>
                  <Input value={editGroupeForm.annee} onChange={e => setEditGroupeForm({...editGroupeForm, annee: e.target.value})} required className="bg-background/50 border-border/80" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-2 block">Formateurs affectés</label>
                  <div className="border border-border/80 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2 bg-background/30">
                    {formateurs?.map((f: any) => (
                      <label key={f.id} className="flex items-center gap-2 cursor-pointer hover:bg-secondary/40 p-1 rounded transition-colors">
                        <input 
                          type="checkbox"
                          checked={editGroupeForm.formateur_ids.includes(f.id)}
                          onChange={() => toggleFormateurSelection(f.id, true)}
                          className="rounded text-primary focus:ring-primary w-4 h-4"
                        />
                        <span className="text-sm font-medium text-foreground">{f.name}</span>
                      </label>
                    ))}
                  </div>
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

      {/* Details & Export Modal */}
      {isDetailOpen && activeGroup && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl border-none shadow-2xl glass animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-primary" /> Groupe : {activeGroup.name}
                </CardTitle>
                <span className="text-xs text-muted-foreground font-medium">{activeGroup.filiere} — {activeGroup.annee}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => exportToExcel(groupDetails)} variant="outline" size="sm" className="h-8 text-xs font-bold border-emerald-600/30 text-emerald-600 hover:bg-emerald-50">
                  <Download className="w-3.5 h-3.5 mr-1" /> Excel
                </Button>
                <Button onClick={() => exportToPDF(groupDetails)} variant="outline" size="sm" className="h-8 text-xs font-bold border-primary/30 text-primary hover:bg-primary/5">
                  <FileText className="w-3.5 h-3.5 mr-1" /> PDF
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { setIsDetailOpen(false); setGroupDetails(null); }} className="rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingDetails ? (
                <div className="py-20 text-center text-muted-foreground animate-pulse font-medium">Chargement des membres et des affectations...</div>
              ) : groupDetails ? (
                <div className="space-y-6">
                  {/* Linked Formateurs */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-base text-foreground border-l-4 border-primary pl-2">Formateurs liés à ce groupe</h3>
                    <div className="flex flex-wrap gap-2">
                      {groupDetails.formateurs && groupDetails.formateurs.length > 0 ? (
                        groupDetails.formateurs.map((formateur: any) => (
                          <div key={formateur.id} className="px-3 py-1.5 rounded-lg bg-secondary/80 text-muted-foreground font-semibold text-xs border border-border/40">
                            {formateur.name} ({formateur.email})
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Aucun formateur affecté.</span>
                      )}
                    </div>
                  </div>

                  {/* Students List */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-base text-foreground border-l-4 border-accent pl-2">
                      Stagiaires affectés ({groupDetails.stagiaires?.length || 0})
                    </h3>
                    <div className="border border-border/60 rounded-xl overflow-hidden">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-secondary/40 text-muted-foreground uppercase">
                          <tr>
                            <th className="px-4 py-3">Stagiaire</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Téléphone</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {groupDetails.stagiaires && groupDetails.stagiaires.length > 0 ? (
                            groupDetails.stagiaires.map((stagiaire: any) => (
                              <tr key={stagiaire.id} className="hover:bg-secondary/20">
                                <td className="px-4 py-3 font-semibold text-foreground">{stagiaire.name}</td>
                                <td className="px-4 py-3 text-muted-foreground">{stagiaire.email}</td>
                                <td className="px-4 py-3 text-muted-foreground">{stagiaire.phone || 'Non renseigné'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground italic">Aucun stagiaire dans ce groupe.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminGroupes;
