import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { User, Phone, Lock, Upload, CheckCircle, AlertCircle, Eye, ShieldCheck, Mail, Users, GraduationCap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ProfilStagiaire = () => {
  const queryClient = useQueryClient();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch current student profile details
  const { data: profile, isLoading } = useQuery({
    queryKey: ['stagiaireProfile'],
    queryFn: async () => {
      const { data } = await api.get('/stagiaire/profile');
      setPhone(data.phone || '');
      return data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: (formData: FormData) => api.post('/stagiaire/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    onSuccess: (updatedUser) => {
      setSuccessMsg('Votre profil a été mis à jour avec succès !');
      setErrorMsg('');
      setPassword('');
      setPasswordConfirmation('');
      setSelectedAvatar(null);
      
      // Update global query caches
      queryClient.invalidateQueries({ queryKey: ['stagiaireProfile'] });
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Erreur lors de la mise à jour.');
      setSuccessMsg('');
    }
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password.length < 6) {
      setErrorMsg('Le mot de passe doit faire au moins 6 caractères.');
      return;
    }
    if (password !== passwordConfirmation) {
      setErrorMsg('Les mots de passe ne correspondent pas.');
      return;
    }

    const formData = new FormData();
    formData.append('phone', phone);
    if (password) {
      formData.append('password', password);
      formData.append('password_confirmation', passwordConfirmation);
    }
    if (selectedAvatar) {
      formData.append('avatar', selectedAvatar);
    }

    updateMutation.mutate(formData);
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse font-medium">Chargement de votre profil...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Mon Profil</h1>
        <p className="text-muted-foreground mt-1">Consultez vos données d'inscription et mettez à jour vos informations personnelles.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Summary Profile Photo */}
        <Card className="glass border-none shadow-sm flex flex-col items-center p-6 space-y-4 h-fit">
          <div className="relative">
            <div className="w-28 h-28 rounded-full border-4 border-primary/25 bg-secondary flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : profile?.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-muted-foreground" />
              )}
            </div>
            
            {/* Avatar input button overlay */}
            <label className="absolute bottom-0 right-0 p-2 bg-primary hover:bg-primary/95 text-primary-foreground rounded-full cursor-pointer shadow-md transition-transform active:scale-95">
              <Upload className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>

          <div className="text-center space-y-1">
            <h3 className="font-extrabold text-lg text-foreground">{profile?.name}</h3>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary uppercase">
              Rôle : {profile?.role}
            </span>
          </div>

          {/* Details */}
          <div className="w-full border-t border-border/80 pt-4 space-y-3">
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <Mail className="w-4 h-4 text-primary" />
              <span className="font-medium truncate">{profile?.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <Users className="w-4 h-4 text-accent" />
              <span className="font-bold text-foreground">Groupe : {profile?.groupe?.name || 'Non rattaché'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <GraduationCap className="w-4 h-4 text-emerald-500" />
              <span className="font-medium">Filière : {profile?.groupe?.filiere || 'Non rattaché'}</span>
            </div>
          </div>
        </Card>

        {/* Right Card: Editing Settings */}
        <Card className="glass border-none shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> Modifier mes paramètres personnels
            </CardTitle>
            <CardDescription>Mettez à jour votre mot de passe, ou modifiez votre numéro de téléphone.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {successMsg && (
                <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="p-3 bg-destructive/15 text-destructive rounded-lg text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {errorMsg}
                </div>
              )}

              {/* Telephone */}
              <div className="space-y-2">
                <Label htmlFor="phoneField" className="text-xs font-bold text-foreground/80 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Téléphone portable</Label>
                <Input 
                  id="phoneField"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Ex : +212 600 00 00 00"
                  className="bg-card border-border/80 focus:border-primary"
                />
              </div>

              {/* Password Section */}
              <div className="pt-2 border-t space-y-4">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-primary" /> Changer de mot de passe (Facultatif)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passField">Nouveau mot de passe</Label>
                    <Input 
                      id="passField"
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min 6 caractères"
                      className="bg-card border-border/80"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passConfirmField">Confirmer le mot de passe</Label>
                    <Input 
                      id="passConfirmField"
                      type="password"
                      value={passwordConfirmation}
                      onChange={e => setPasswordConfirmation(e.target.value)}
                      placeholder="À répéter à l'identique"
                      className="bg-card border-border/80"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold shadow px-6"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Sauvegarde en cours..." : "Enregistrer les modifications"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilStagiaire;
