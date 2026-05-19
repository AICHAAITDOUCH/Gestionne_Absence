import { useState } from 'react';
import { useForm as useHookForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useHookForm();
  const { login } = useAuthStore();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    try {
      setError('');
      await login(data);
      // navigation handled by protected routes/auth layout
    } catch (err: any) {
      setError(err.response?.data?.message || 'Identifiants incorrects');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <Card className="glass border-none shadow-xl">
        <CardHeader className="space-y-2 text-center">
         <div className="mx-auto w-40 h-40 rounded-full flex items-center justify-center mb-4 overflow-hidden">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-25 h-25 object-contain"
            />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">CMC</CardTitle>
          <CardDescription>
            Entrez vos identifiants pour accéder à votre espace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm font-medium">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nom@exemple.com"
                {...register('email', { required: 'L\'email est requis' })}
                className="bg-background/50"
              />
              {errors.email && <span className="text-sm text-destructive">{errors.email.message as string}</span>}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Mot de passe</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">Mot de passe oublié ?</Link>
              </div>
              <Input
                id="password"
                type="password"
                {...register('password', { required: 'Le mot de passe est requis' })}
                className="bg-background/50"
              />
              {errors.password && <span className="text-sm text-destructive">{errors.password.message as string}</span>}
            </div>
            <Button type="submit" className="w-full h-11 text-base">
              Se connecter
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Login;
