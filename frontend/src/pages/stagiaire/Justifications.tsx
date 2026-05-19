import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { FileUp, Calendar, AlertCircle, HelpCircle, CheckCircle, FileText, Download, Clock, X, Paperclip } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import moment from 'moment';

const Justifications = () => {
  const queryClient = useQueryClient();
  const location = useLocation();
  
  const [selectedAbsence, setSelectedAbsence] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [motif, setMotif] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Fetch student's absences (to find those that are non-justified)
  const { data: absences } = useQuery({
    queryKey: ['myStagiaireAbsences'],
    queryFn: async () => (await api.get('/stagiaire/absences')).data
  });

  // Filter only 'absent' status that do not have a justification yet
  const nonJustifiedAbsences = absences?.filter((a: any) => 
    a.status === 'absent' && !a.justification
  ) || [];

  // Fetch submitted justifications
  const { data: justifications, isLoading } = useQuery({
    queryKey: ['myJustifications'],
    queryFn: async () => (await api.get('/stagiaire/justifications')).data
  });

  // Check if we navigated here with a pre-selected absence ID in the state
  useEffect(() => {
    if (location.state && (location.state as any).selectedAbsenceId) {
      setSelectedAbsence(String((location.state as any).selectedAbsenceId));
    }
  }, [location.state]);

  const submitMutation = useMutation({
    mutationFn: (formData: FormData) => api.post('/justifications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    onSuccess: () => {
      setSubmitSuccess('Votre pièce justificative a été soumise avec succès !');
      setSubmitError('');
      setSelectedAbsence('');
      setSelectedFile(null);
      setMotif('');
      
      // Invalidate queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['myJustifications'] });
      queryClient.invalidateQueries({ queryKey: ['myStagiaireAbsences'] });
      queryClient.invalidateQueries({ queryKey: ['stagiaireStats'] });
    },
    onError: (err: any) => {
      setSubmitError(err.response?.data?.message || 'Une erreur est survenue lors de la soumission.');
      setSubmitSuccess('');
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setSubmitError('Le fichier dépasse la limite autorisée de 2 Mo.');
        setSelectedFile(null);
        return;
      }
      setSubmitError('');
      setSelectedFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAbsence) {
      setSubmitError('Veuillez sélectionner l\'absence concernée.');
      return;
    }
    if (!motif.trim()) {
      setSubmitError('Veuillez renseigner le motif de votre absence.');
      return;
    }
    if (!selectedFile) {
      setSubmitError('Veuillez joindre une pièce justificative (PDF ou image).');
      return;
    }

    const formData = new FormData();
    formData.append('presence_id', selectedAbsence);
    formData.append('document', selectedFile);
    formData.append('motif', motif);

    submitMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Mes Justifications</h1>
        <p className="text-muted-foreground mt-1">Transmettez des documents pour justifier vos absences et suivez leur traitement.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Upload Form */}
        <Card className="glass border-none shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileUp className="w-5 h-5 text-primary" /> Justifier une absence
            </CardTitle>
            <CardDescription>Fournissez un certificat médical, une attestation officielle en format PDF, PNG ou JPG (max 2 Mo).</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <div className="p-3 bg-destructive/15 text-destructive rounded-lg text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {submitError}
                </div>
              )}
              {submitSuccess && (
                <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> {submitSuccess}
                </div>
              )}

              {/* Select Absence */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground/80 block">Absence concernée</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={selectedAbsence}
                  onChange={e => setSelectedAbsence(e.target.value)}
                >
                  <option value="">-- Sélectionner l'absence --</option>
                  {nonJustifiedAbsences.map((a: any) => (
                    <option key={a.id} value={a.id}>
                      {moment(a.seance?.date).format('DD/MM/YYYY')} : {a.seance?.module?.name}
                    </option>
                  ))}
                </select>
                {nonJustifiedAbsences.length === 0 && (
                  <span className="text-[10px] text-muted-foreground block italic">Aucune absence non justifiée répertoriée.</span>
                )}
              </div>

              {/* Motif / Raison */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground/80 block">Motif de l'absence</label>
                <textarea 
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none focus:border-primary"
                  placeholder="Ex: Certificat médical, convocation officielle, raison familiale..."
                  value={motif}
                  onChange={e => setMotif(e.target.value)}
                  maxLength={500}
                />
              </div>

              {/* Upload input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground/80 block">Pièce justificative</label>
                <div className="border-2 border-dashed border-border/70 hover:border-primary/50 transition-colors rounded-xl p-6 text-center cursor-pointer relative bg-secondary/20">
                  <input 
                    type="file" 
                    accept=".pdf,.png,.jpg,.jpeg" 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="space-y-2">
                    <Paperclip className="w-8 h-8 text-muted-foreground mx-auto" />
                    <p className="text-xs font-semibold text-foreground">
                      {selectedFile ? selectedFile.name : "Cliquez ou glissez votre fichier ici"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">PDF, PNG, JPG jusqu'à 2 Mo</p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow mt-2"
                disabled={submitMutation.isPending || nonJustifiedAbsences.length === 0}
              >
                {submitMutation.isPending ? "Transmission en cours..." : "Soumettre la justification"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Side: Justifications History */}
        <Card className="glass border-none shadow-sm lg:col-span-2 overflow-hidden flex flex-col h-full min-h-[400px]">
          <CardHeader className="pb-3 border-b bg-card/50">
            <CardTitle className="text-lg font-bold text-foreground">Historique de mes justifications</CardTitle>
            <CardDescription>Suivez l'avancement et le verdict de vos demandes transmises aux administrateurs.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground animate-pulse">Chargement de votre historique...</div>
            ) : (!justifications || justifications.length === 0) ? (
              <div className="p-8 text-center text-muted-foreground italic text-sm">Vous n'avez soumis aucune justification pour le moment.</div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/40 text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Absence Justifiée</th>
                    <th className="px-6 py-3 font-semibold">Date d'Envoi</th>
                    <th className="px-6 py-3 font-semibold">Statut</th>
                    <th className="px-6 py-3 font-semibold">Décision / Remarque</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {justifications.map((j: any) => (
                    <tr key={j.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground text-sm">
                            {moment(j.presence?.seance?.date).format('DD/MM/YYYY')}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[180px]">
                            {j.presence?.seance?.module?.name}
                          </span>
                          <span className="text-[11px] text-foreground/95 bg-secondary/30 border border-border/40 rounded px-1.5 py-0.5 mt-1 block italic max-w-[200px] truncate">
                            Motif : {j.motif}
                          </span>
                          <a 
                            href={j.document_path} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[10px] text-primary hover:underline font-bold mt-1.5 flex items-center gap-0.5"
                          >
                            📄 Pièce jointe
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs font-semibold">
                        {moment(j.created_at).format('DD/MM/YYYY à HH:mm')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          j.status === 'en_attente' 
                            ? 'bg-amber-500/10 text-amber-600'
                            : j.status === 'accepte'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          {j.status === 'en_attente' && <Clock className="w-3 h-3" />}
                          {j.status === 'accepte' && <CheckCircle className="w-3 h-3" />}
                          {j.status === 'refuse' && <X className="w-3 h-3" />}
                          {j.status === 'en_attente' ? 'En attente' : j.status === 'accepte' ? 'Acceptée' : 'Refusée'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground italic max-w-[200px] truncate">
                        {j.admin_remarque || 'Aucune remarque'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Justifications;
