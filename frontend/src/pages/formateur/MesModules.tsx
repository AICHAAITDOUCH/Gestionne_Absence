import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Search, BookOpen, Clock, Users } from 'lucide-react';

const MesModules = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch modules belonging to this formateur
  const { data: modules, isLoading } = useQuery({
    queryKey: ['myModules'],
    queryFn: async () => (await api.get('/formateur/modules')).data
  });

  const filteredModules = modules?.filter((mod: any) => 
    mod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mod.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mod.groupe?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse font-medium">Chargement de vos modules...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Mes Modules</h1>
          <p className="text-muted-foreground mt-1">Consultez les modules de formation qui vous sont attribués et leurs volumes horaires.</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Rechercher par nom du module, code ou groupe..." 
          className="pl-9 bg-card border-border/80 focus:border-primary max-w-md"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules?.map((mod: any) => (
          <Card key={mod.id} className="glass border-none shadow-sm hover:scale-[1.02] transition-all duration-200 flex flex-col justify-between overflow-hidden relative">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <span className="inline-flex items-center px-2.5 py-1 rounded bg-primary/10 text-primary font-bold text-xs">
                  {mod.code}
                </span>
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {mod.volume_horaire || '0'} H
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="font-bold text-lg text-foreground leading-snug flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary/70 shrink-0" />
                  {mod.name}
                </h3>
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-6 py-4 bg-secondary/30 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-muted-foreground/80" />
                <span>Groupe :</span>
              </div>
              <span className="text-foreground font-bold bg-card border px-2 py-0.5 rounded">
                {mod.groupe?.name || 'Non associé'}
              </span>
            </div>
          </Card>
        ))}

        {filteredModules?.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground italic">
            Aucun module ne correspond à votre recherche.
          </div>
        )}
      </div>
    </div>
  );
};

export default MesModules;
