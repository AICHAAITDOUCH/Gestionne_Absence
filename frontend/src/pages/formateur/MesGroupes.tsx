import React, { useState } from 'react';
import moment from 'moment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Eye, GraduationCap, X, Calendar, BookOpen, Clock, FileText, Download } from 'lucide-react';

const MesGroupes = () => {
  // Modals state
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<any>(null);
  const [groupDetails, setGroupDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch groups affected to formateur
  const { data: groupes, isLoading } = useQuery({
    queryKey: ['myGroupes'],
    queryFn: async () => (await api.get('/formateur/groupes')).data
  });

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

  // CSV EXPORT FOR LIST OF STUDENTS
  const exportToCSV = (group: any) => {
    if (!group) return;
    const headers = 'Nom complet,Email,Téléphone\n';
    const rows = group.stagiaires?.map((s: any) => 
      `"${s.name}","${s.email}","${s.phone || ''}"`
    ).join('\n') || '';
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `stagiaires_groupe_${group.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse font-medium">Chargement de vos groupes...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Mes Groupes</h1>
        <p className="text-muted-foreground mt-1">Consultez la liste et le détail des groupes et des classes qui vous sont affectés.</p>
      </div>

      {/* Main Table Card */}
      <Card className="glass border-none overflow-hidden flex flex-col h-full min-h-[400px]">
        <div className="p-4 border-b flex items-center justify-between bg-card/50">
          <span className="text-sm font-semibold text-foreground">Vos classes affectées</span>
          <span className="text-sm text-muted-foreground font-medium bg-secondary/50 px-3 py-1 rounded-full">{groupes?.length || 0} groupe(s)</span>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/80 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 font-semibold">Groupe</th>
                <th className="px-6 py-4 font-semibold">Filière / Secteur</th>
                <th className="px-6 py-4 font-semibold">Année scolaire</th>
                <th className="px-6 py-4 font-semibold">Nombre d'élèves</th>
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
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                      {groupe.stagiaires_count} stagiaires
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary text-primary font-bold" onClick={() => handleViewDetails(groupe)}>
                      <Eye className="w-4 h-4 mr-1.5" /> Voir Détails
                    </Button>
                  </td>
                </tr>
              ))}
              {(!groupes || groupes.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    Aucun groupe ne vous est actuellement affecté.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Details & Export Modal */}
      {isDetailOpen && activeGroup && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl border-none shadow-2xl glass animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-primary" /> Groupe : {activeGroup.name}
                </CardTitle>
                <span className="text-xs text-muted-foreground font-medium">{activeGroup.filiere} — {activeGroup.annee}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => exportToCSV(groupDetails)} variant="outline" size="sm" className="h-8 text-xs font-bold border-emerald-600/30 text-emerald-600 hover:bg-emerald-50">
                  <Download className="w-3.5 h-3.5 mr-1" /> Exporter CSV Stagiaires
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { setIsDetailOpen(false); setGroupDetails(null); }} className="rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingDetails ? (
                <div className="py-20 text-center text-muted-foreground animate-pulse font-medium">Chargement des membres du groupe...</div>
              ) : groupDetails ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column: List of Students */}
                  <div className="md:col-span-2 space-y-2">
                    <h3 className="font-bold text-base text-foreground border-l-4 border-primary pl-2 mb-3">
                      Stagiaires du groupe ({groupDetails.stagiaires?.length || 0})
                    </h3>
                    <div className="border border-border/65 rounded-xl overflow-hidden bg-card/20">
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

                  {/* Right Column: Linked Modules & Sessions list */}
                  <div className="space-y-4">
                    {/* Linked Modules */}
                    <div>
                      <h3 className="font-bold text-base text-foreground border-l-4 border-accent pl-2 mb-3">Modules du groupe</h3>
                      <div className="space-y-2">
                        {groupDetails.modules && groupDetails.modules.length > 0 ? (
                          groupDetails.modules.map((mod: any) => (
                            <div key={mod.id} className="p-3 bg-secondary/30 border border-border/40 rounded-lg space-y-1">
                              <span className="font-bold text-xs text-primary">{mod.code}</span>
                              <h4 className="font-bold text-foreground text-sm leading-snug">{mod.name}</h4>
                              <span className="text-[10px] text-muted-foreground block">{mod.volume_horaire} heures prévues</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic block">Aucun module lié.</span>
                        )}
                      </div>
                    </div>

                    {/* Linked Sessions */}
                    <div>
                      <h3 className="font-bold text-base text-foreground border-l-4 border-emerald-500 pl-2 mb-3">Dernières Séances</h3>
                      <div className="space-y-2">
                        {groupDetails.seances && groupDetails.seances.length > 0 ? (
                          groupDetails.seances.slice(0, 5).map((seance: any) => (
                            <div key={seance.id} className="p-3 bg-secondary/30 border border-border/40 rounded-lg space-y-1">
                              <div className="flex justify-between items-center text-[10px] font-bold">
                                <span className="text-emerald-600">{seance.type?.toUpperCase()}</span>
                                <span className="text-muted-foreground">{moment(seance.date).format('DD/MM/YYYY')}</span>
                              </div>
                              <span className="text-xs text-foreground font-semibold block truncate">{seance.module?.name}</span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {seance.heure_debut} - {seance.heure_fin}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic block">Aucune séance planifiée.</span>
                        )}
                      </div>
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

export default MesGroupes;
