import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (login(username, password)) {
            toast({
                title: 'Bienvenido',
                description: `Has iniciado sesión como ${username}`,
            });
            navigate('/dashboard');
        } else {
            setError('Credenciales inválidas. Intente con admin/1234, tecnico1/1234 o peon1/1234');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-soft" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/15 rounded-full blur-3xl animate-pulse-soft" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo and title */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 glow-accent">
                        <Leaf className="w-10 h-10 text-cream" />
                    </div>
                    <h1 className="text-4xl font-display font-bold gradient-text mb-2">Finca El Sol</h1>
                    <p className="text-muted-foreground">Sistema de Gestión Agrícola</p>
                </div>

                {/* Login card */}
                <div className="glass-card p-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-foreground/80">Usuario</Label>
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Ingrese su usuario"
                                className="bg-muted/50 border-border/50 focus:border-accent"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-foreground/80">Contraseña</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Ingrese su contraseña"
                                    className="bg-muted/50 border-border/50 focus:border-accent pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            variant="accent"
                            size="lg"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                                    Iniciando sesión...
                                </div>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </Button>
                    </form>

                    {/* Demo credentials */}
                    <div className="mt-6 pt-6 border-t border-border/50">
                        <p className="text-xs text-muted-foreground text-center mb-3">Credenciales de prueba</p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            {[
                                { user: 'admin', role: 'Admin' },
                                { user: 'tecnico1', role: 'Técnico' },
                                { user: 'peon1', role: 'Peón' },
                            ].map(({ user, role }) => (
                                <button
                                    key={user}
                                    type="button"
                                    onClick={() => {
                                        setUsername(user);
                                        setPassword('1234');
                                    }}
                                    className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-center"
                                >
                                    <span className="block text-foreground font-medium">{user}</span>
                                    <span className="text-muted-foreground">{role}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-6">
                    © 2025 Finca El Sol • Sistema ERP Agrícola
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
