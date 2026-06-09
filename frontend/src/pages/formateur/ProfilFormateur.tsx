import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { 
  User, Phone, Lock, Upload, CheckCircle, AlertCircle, 
  ShieldCheck, Mail, Users, GraduationCap, Calendar, 
  BookOpen, KeyRound, CheckCircle2, X, Briefcase, Award
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';

const ProfilFormateur = () => {
  const queryClient = useQueryClient();
  
  // State for form fields
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialite, setSpecialite] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  
  // File upload state
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Toast notifications state
  const [toasts, setToasts] = useState<{ id: string; type: 'success' | 'error'; message: string }[]>([]);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Fetch Formateur profile details with stats and groups
  const { data: profile, isLoading } = useQuery({
    queryKey: ['formateurProfile'],
    queryFn: async () => {
      const { data } = await api.get('/profile');
      
      // Split database name into Nom and Prenom
      const nameParts = data.name ? data.name.trim().split(/\s+/) : ['', ''];
      const first = nameParts[0] || '';
      const last = nameParts.slice(1).join(' ') || '';
      
      setPrenom(first);
      setNom(last);
      setEmail(data.email || '');
      setPhone(data.phone || '');
      setSpecialite(data.specialite || '');
      
      return data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: (formData: FormData) => api.post('/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    onSuccess: (res) => {
      addToast('success', 'Votre profil formateur a été mis à jour avec succès !');
      setPassword('');
      setPasswordConfirmation('');
      setSelectedAvatar(null);
      
      // Update global caches
      queryClient.invalidateQueries({ queryKey: ['formateurProfile'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de la mise à jour du profil.';
      addToast('error', msg);
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
    
    if (!prenom.trim() || !nom.trim()) {
      addToast('error', 'Le nom et le prénom sont obligatoires.');
      return;
    }
    if (!email.trim()) {
      addToast('error', "L'adresse email est obligatoire.");
      return;
    }
    if (password && password.length < 6) {
      addToast('error', 'Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== passwordConfirmation) {
      addToast('error', 'Les mots de passe ne correspondent pas.');
      return;
    }

    const formData = new FormData();
    formData.append('_method', 'PUT'); // For Laravel PUT simulation via POST
    formData.append('name', `${prenom} ${nom}`.trim());
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('specialite', specialite);
    
    if (password) {
      formData.append('password', password);
      formData.append('password_confirmation', passwordConfirmation);
    }
    if (selectedAvatar) {
      formData.append('avatar', selectedAvatar);
    }

    updateMutation.mutate(formData);
  };

  // Skeleton Loader for sleek premium loading state
  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse p-2">
        <div className="space-y-2">
          <div className="h-8 bg-secondary/80 rounded w-1/4"></div>
          <div className="h-4 bg-secondary/60 rounded w-2/5"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-card border flex items-center p-6 space-x-4">
              <div className="w-12 h-12 rounded-lg bg-secondary"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-secondary rounded w-3/4"></div>
                <div className="h-6 bg-secondary rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 rounded-xl bg-card border p-6 flex flex-col items-center justify-center space-y-4">
            <div className="w-28 h-28 rounded-full bg-secondary"></div>
            <div className="h-6 bg-secondary rounded w-1/2"></div>
            <div className="h-4 bg-secondary rounded w-1/3"></div>
          </div>
          <div className="lg:col-span-2 h-96 rounded-xl bg-card border"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative pb-10">
      
      {/* Toast Notifications */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`p-4 rounded-xl shadow-lg border backdrop-blur-md flex items-center justify-between gap-3 text-sm font-semibold transition-all ${
                toast.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-destructive/10 border-destructive/20 text-destructive'
              }`}
            >
              <div className="flex items-center gap-2">
                {toast.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                )}
                <span>{toast.message}</span>
              </div>
              <button onClick={() => removeToast(toast.id)} className="p-1 hover:bg-secondary rounded-lg shrink-0">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
          Mon Profil Formateur
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Gérez vos informations de formateur, spécialités, et visualisez vos statistiques d'enseignement.
        </p>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Stat Card 1: Groupes */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          className="bg-card border border-border/60 shadow-sm rounded-xl p-5 flex items-center gap-4 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Groupes Affectés</p>
            <h4 className="text-2xl font-black text-foreground mt-0.5">{profile?.stats?.total_groupes ?? 0}</h4>
          </div>
        </motion.div>

        {/* Stat Card 2: Séances */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          className="bg-card border border-border/60 shadow-sm rounded-xl p-5 flex items-center gap-4 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Séances Effectuées</p>
            <h4 className="text-2xl font-black text-foreground mt-0.5">{profile?.stats?.total_seances ?? 0}</h4>
          </div>
        </motion.div>

        {/* Stat Card 3: Stagiaires */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          className="bg-card border border-border/60 shadow-sm rounded-xl p-5 flex items-center gap-4 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Stagiaires</p>
            <h4 className="text-2xl font-black text-foreground mt-0.5">{profile?.stats?.total_stagiaires ?? 0}</h4>
          </div>
        </motion.div>

        {/* Stat Card 4: Taux de présence */}
        <motion.div 
          whileHover={{ y: -4, scale: 1.01 }}
          className="bg-card border border-border/60 shadow-sm rounded-xl p-5 flex items-center gap-4 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Taux Présence Moyen</p>
            <h4 className="text-2xl font-black text-foreground mt-0.5">{profile?.stats?.taux_presence ?? 100}%</h4>
          </div>
        </motion.div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Avatar Summary & Assigned Groups List */}
        <div className="space-y-6 flex flex-col">
          
          {/* Avatar summary card */}
          <Card className="border border-border/60 shadow-sm flex flex-col items-center p-6 space-y-6 h-fit bg-card">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-primary/25 bg-secondary flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/50 shadow-md">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : profile?.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-white text-4xl font-extrabold">
                    {prenom.charAt(0)}{nom.charAt(0)}
                  </div>
                )}
              </div>
              
              {/* Upload button overlay */}
              <label className="absolute bottom-1 right-1 p-2 bg-primary hover:bg-primary/95 text-white rounded-full cursor-pointer shadow-lg transition-transform active:scale-95 hover:scale-105">
                <Upload className="w-4.5 h-4.5" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-extrabold text-xl text-foreground truncate max-w-[240px]">
                {prenom} {nom}
              </h3>
              <div className="flex flex-col items-center gap-1.5">
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-500 uppercase tracking-widest border border-emerald-500/20">
                  Rôle : {profile?.role}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                  <Award className="w-3 h-3" />
                  {specialite ? specialite : 'Spécialité non définie'}
                </span>
              </div>
            </div>

            {/* Contact details list */}
            <div className="w-full border-t border-border/80 pt-5 space-y-3.5">
              <div className="flex items-center gap-3 text-xs text-muted-foreground bg-secondary/35 p-2.5 rounded-lg border border-border/30">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span className="font-semibold truncate flex-1" title={email}>{email}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground bg-secondary/35 p-2.5 rounded-lg border border-border/30">
                <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="font-bold text-foreground truncate flex-1">
                  {phone ? phone : 'Aucun téléphone renseigné'}
                </span>
              </div>
            </div>
          </Card>

          {/* Groups list card */}
          <Card className="border border-border/60 shadow-sm p-5 bg-card flex-1">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2 mb-4">
              <BookOpen className="w-4.5 h-4.5 text-primary" /> Groupes Affectés ({profile?.groupes?.length ?? 0})
            </h4>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {profile?.groupes && profile.groupes.length > 0 ? (
                profile.groupes.map((grp: any) => (
                  <div key={grp.id} className="p-3 bg-secondary/30 rounded-xl border border-border/50 flex flex-col space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-sm text-foreground">{grp.name}</span>
                      <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/15">
                        {grp.stagiaires_count} stagiaires
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" /> Filière : {grp.filiere || 'Générique'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground text-xs font-semibold">
                  Aucun groupe affecté pour le moment.
                </div>
              )}
            </div>
          </Card>

        </div>

        {/* Right Side: Account Settings and Form Card */}
        <Card className="border border-border/60 shadow-sm lg:col-span-2 bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> Modifier les informations personnelles
            </CardTitle>
            <CardDescription className="text-xs">
              Mettez à jour vos informations personnelles, votre numéro de téléphone et votre spécialité.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Name fields in grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prenomField" className="text-xs font-bold text-foreground/80">Prénom</Label>
                  <Input 
                    id="prenomField"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Votre prénom"
                    className="bg-secondary/20 border-border/60 focus:border-primary focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nomField" className="text-xs font-bold text-foreground/80">Nom de famille</Label>
                  <Input 
                    id="nomField"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Votre nom"
                    className="bg-secondary/20 border-border/60 focus:border-primary focus:bg-background transition-all"
                  />
                </div>
              </div>

              {/* Email & Phone fields in grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailField" className="text-xs font-bold text-foreground/80 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-muted-foreground" /> Adresse email
                  </Label>
                  <Input 
                    id="emailField"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="formateur@smartabsence.com"
                    className="bg-secondary/20 border-border/60 focus:border-primary focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneField" className="text-xs font-bold text-foreground/80 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-muted-foreground" /> Numéro de téléphone
                  </Label>
                  <Input 
                    id="phoneField"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex : +212 600 00 00 00"
                    className="bg-secondary/20 border-border/60 focus:border-primary focus:bg-background transition-all"
                  />
                </div>
              </div>

              {/* Specialty Field */}
              <div className="space-y-2">
                <Label htmlFor="specialiteField" className="text-xs font-bold text-foreground/80 flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-muted-foreground" /> Spécialité d'enseignement
                </Label>
                <Input 
                  id="specialiteField"
                  value={specialite}
                  onChange={(e) => setSpecialite(e.target.value)}
                  placeholder="Ex : Développement Web, IA, Design Graphique, Réseaux"
                  className="bg-secondary/20 border-border/60 focus:border-primary focus:bg-background transition-all"
                />
              </div>

              {/* Password Section */}
              <div className="pt-4 border-t border-border/60 space-y-4">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-primary" /> Sécurité & Mot de passe (Facultatif)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passField" className="text-xs font-bold text-foreground/70">Nouveau mot de passe</Label>
                    <Input 
                      id="passField"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 caractères"
                      className="bg-secondary/20 border-border/60 focus:border-primary focus:bg-background transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passConfirmField" className="text-xs font-bold text-foreground/70">Confirmer le mot de passe</Label>
                    <Input 
                      id="passConfirmField"
                      type="password"
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      placeholder="Répétez le mot de passe"
                      className="bg-secondary/20 border-border/60 focus:border-primary focus:bg-background transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/95 hover:to-blue-600/95 text-white font-bold shadow-md px-8 py-5 text-sm rounded-xl transition-all active:scale-95"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Sauvegarde en cours..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default ProfilFormateur;
