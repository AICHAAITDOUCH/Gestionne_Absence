import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Check, ArrowLeft, ShieldAlert, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import moment from 'moment';

const FaireAppel = () => {
  const { seanceId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Local state to manage the attendance grid
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [isValidatedCheckbox, setIsValidatedCheckbox] = useState(false);

  // Fetch session details
  const { data: seance, isLoading: loadingSeance } = useQuery({
    queryKey: ['seanceDetails', seanceId],
    queryFn: async () => (await api.get(`/seances/${seanceId}`)).data
  });

  // Fetch presences for this session
  const { data: presencesData, isLoading: loadingPresences } = useQuery({
    queryKey: ['seancePresences', seanceId],
    queryFn: async () => (await api.get(`/presences/seance/${seanceId}`)).data
  });

  // Synchronize dynamic API response into local state for editing
  useEffect(() => {
    if (presencesData) {
      setAttendanceList(
        presencesData.map((p: any) => ({
          stagiaire_id: p.stagiaire_id,
          name: p.stagiaire?.name || 'Stagiaire inconnu',
          status: p.status || 'present',
          remarque: p.remarque || ''
        }))
      );
    }
  }, [presencesData]);

  useEffect(() => {
    if (seance) {
      setIsValidatedCheckbox(seance.is_validated);
    }
  }, [seance]);

  // Batch Save Mutation
  const saveMutation = useMutation({
    mutationFn: (data: any) => api.post('/presences/batch', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seanceDetails', seanceId] });
      queryClient.invalidateQueries({ queryKey: ['seancePresences', seanceId] });
      queryClient.invalidateQueries({ queryKey: ['mySeances'] });
      alert("Feuille d'appel enregistrée avec succès !");
      navigate('/formateur/seances');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Erreur lors de la sauvegarde.");
    }
  });

  const handleStatusChange = (stagiaireId: number, status: string) => {
    if (seance?.is_validated) return; // locked
    setAttendanceList(prev => 
      prev.map(item => item.stagiaire_id === stagiaireId ? { ...item, status } : item)
    );
  };

  const handleRemarqueChange = (stagiaireId: number, remarque: string) => {
    if (seance?.is_validated) return; // locked
    setAttendanceList(prev => 
      prev.map(item => item.stagiaire_id === stagiaireId ? { ...item, remarque } : item)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      seance_id: seanceId,
      presences: attendanceList,
      is_validated: isValidatedCheckbox
    });
  };

  if (loadingSeance || loadingPresences) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse font-medium">Chargement de la feuille d'appel...</div>;
  }

  if (!seance) {
    return <div className="text-destructive p-8 text-center font-bold">Séance introuvable.</div>;
  }

  const isLocked = seance.is_validated;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate('/formateur/seances')} className="rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Feuille d'appel : {seance.module?.name}
            </h1>
            <p className="text-muted-foreground text-xs font-medium">
              Groupe : <span className="font-bold text-accent">{seance.groupe?.name}</span> • {moment(seance.date).format('DD/MM/YYYY')} • {seance.heure_debut} - {seance.heure_fin} ({seance.type?.toUpperCase()})
            </p>
          </div>
        </div>

        <div>
          {isLocked ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 border border-emerald-600/20">
              <CheckCircle className="w-4 h-4" /> Feuille verrouillée
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 border border-amber-600/20">
              <ShieldAlert className="w-4 h-4" /> Appel en cours
            </span>
          )}
        </div>
      </div>

      {isLocked && (
        <Card className="border border-amber-500/20 bg-amber-500/5 text-amber-800">
          <CardContent className="p-4 flex items-center gap-3 text-sm font-semibold">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Cette feuille d'appel est validée et verrouillée. Pour toute correction d'absence, veuillez contacter un administrateur.</span>
          </CardContent>
        </Card>
      )}

      {/* Main Attendance Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="glass border-none overflow-hidden">
          <CardHeader className="pb-3 border-b bg-card/50">
            <CardTitle className="text-base font-bold">Liste d'appel des stagiaires</CardTitle>
            <CardDescription>Cochez le statut de chaque stagiaire pour cette séance.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/80 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-1/3">Stagiaire</th>
                    <th className="px-6 py-4 font-semibold w-2/5 text-center">Statut de présence</th>
                    <th className="px-6 py-4 font-semibold">Remarque / Commentaire</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {attendanceList.map((item) => (
                    <tr key={item.stagiaire_id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-foreground">{item.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-1">
                          <button
                            type="button"
                            disabled={isLocked}
                            onClick={() => handleStatusChange(item.stagiaire_id, 'present')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                              item.status === 'present'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                                : 'bg-background hover:bg-secondary/40 text-muted-foreground border-border/80'
                            }`}
                          >
                            Présent
                          </button>

                          <button
                            type="button"
                            disabled={isLocked}
                            onClick={() => handleStatusChange(item.stagiaire_id, 'absent')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                              item.status === 'absent'
                                ? 'bg-destructive text-white border-destructive shadow'
                                : 'bg-background hover:bg-secondary/40 text-muted-foreground border-border/80'
                            }`}
                          >
                            Absent
                          </button>

                          <button
                            type="button"
                            disabled={isLocked}
                            onClick={() => handleStatusChange(item.stagiaire_id, 'retard')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                              item.status === 'retard'
                                ? 'bg-amber-500 text-white border-amber-500 shadow'
                                : 'bg-background hover:bg-secondary/40 text-muted-foreground border-border/80'
                            }`}
                          >
                            Retard
                          </button>

                          <button
                            type="button"
                            disabled={isLocked}
                            onClick={() => handleStatusChange(item.stagiaire_id, 'justifie')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                              item.status === 'justifie'
                                ? 'bg-blue-600 text-white border-blue-600 shadow'
                                : 'bg-background hover:bg-secondary/40 text-muted-foreground border-border/80'
                            }`}
                          >
                            Justifié
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Input
                          placeholder="Ajouter un commentaire..."
                          value={item.remarque}
                          onChange={(e) => handleRemarqueChange(item.stagiaire_id, e.target.value)}
                          disabled={isLocked}
                          className="bg-background/50 border-border/80 text-xs h-9"
                        />
                      </td>
                    </tr>
                  ))}
                  {attendanceList.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground italic">
                        Aucun stagiaire dans ce groupe.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Lock / Validation Block */}
        {!isLocked && (
          <Card className="glass border-none shadow-sm">
            <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isValidatedCheckbox}
                  onChange={(e) => setIsValidatedCheckbox(e.target.checked)}
                  className="rounded text-primary focus:ring-primary w-4.5 h-4.5 mt-0.5"
                />
                <div>
                  <span className="text-sm font-bold text-foreground block">Valider définitivement la séance</span>
                  <span className="text-xs text-muted-foreground">Une fois validée, la feuille d'appel sera verrouillée et ne pourra plus être modifiée par le formateur.</span>
                </div>
              </label>

              <Button
                type="submit"
                disabled={saveMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 h-11"
              >
                <Check className="w-4 h-4 mr-2" /> Enregistrer l'appel
              </Button>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
};

export default FaireAppel;
