import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import moment from 'moment';
import { CheckCircle, XCircle } from 'lucide-react';

const AdminJustifications = () => {
  const queryClient = useQueryClient();

  const { data: justifications, isLoading } = useQuery({
    queryKey: ['justifications'],
    queryFn: async () => {
      const { data } = await api.get('/justifications');
      return data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => api.put(`/justifications/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['justifications'] })
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse font-medium">Chargement des justifications...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Justifications</h1>
          <p className="text-muted-foreground mt-1">Validez ou refusez les justificatifs d'absence.</p>
        </div>
      </div>

      <Card className="glass border-none">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Stagiaire</th>
                  <th className="px-6 py-4 font-medium">Séance Absente</th>
                  <th className="px-6 py-4 font-medium">Document</th>
                  <th className="px-6 py-4 font-medium">Statut</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {justifications?.map((justif: any) => (
                  <tr key={justif.id} className="hover:bg-secondary/20">
                    <td className="px-6 py-4 font-semibold">{justif.presence?.stagiaire?.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {moment(justif.presence?.seance?.date).format('DD/MM/YYYY')}
                    </td>
                    <td className="px-6 py-4 text-primary underline">
                      <a href={`http://localhost:8000/storage/${justif.document_path}`} target="_blank" rel="noreferrer">
                        Voir le doc
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        justif.status === 'en_attente' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' : 
                        justif.status === 'accepte' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 
                        'bg-destructive/10 text-destructive border border-destructive/20'
                      }`}>
                        {justif.status === 'en_attente' ? 'En attente' : justif.status === 'accepte' ? 'Accepté' : 'Refusé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end space-x-2">
                      {justif.status === 'en_attente' && (
                        <>
                          <Button variant="ghost" size="icon" className="text-emerald-500 hover:bg-emerald-500/10" onClick={() => updateMutation.mutate({ id: justif.id, status: 'accepte' })}>
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => updateMutation.mutate({ id: justif.id, status: 'refuse' })}>
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
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

export default AdminJustifications;
