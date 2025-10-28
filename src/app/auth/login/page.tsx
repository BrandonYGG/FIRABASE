'use client';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link"
import { useState } from "react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth, useFirestore } from '@/firebase';
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, User } from "firebase/auth";
import { Separator } from "@/components/ui/separator";
import { doc, setDoc, getDoc } from "firebase/firestore";

const LoginSchema = z.object({
  email: z.string().email({ message: 'Por favor, ingrese un correo electrónico válido.' }),
  password: z.string().min(1, { message: 'La contraseña es obligatoria.' }),
});

type LoginValues = z.infer<typeof LoginSchema>;

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512S0 403.3 0 261.8C0 120.3 106.5 8 244 8s244 112.3 244 253.8zM88 261.8c0 110.6 73.4 201.3 166 201.3s166-90.7 166-201.3S369.4 60.5 254 60.5 88 151.2 88 261.8zM244 452.5c-32.3 0-62.2-7.5-88.6-20.4l3.2-16.3c15.2-7.8 32.4-12.8 51-14.9-2.3.7-4.7 1.3-7.2 1.8-19.4 4.2-39.8-5.3-48-24.3-7-16.3-.7-35.6 15.2-42.6 16.3-7 35.6-.7 42.6 15.2 2.9 6.7 3.5 13.9 1.9 20.8 14.3-3 29.5-4.6 45.4-4.6 15.9 0 31.1 1.6 45.4 4.6-1.6-6.9-1-14.1 1.9-20.8 7-16 26.3-22.2 42.6-15.2 16 7 22.2 26.3 15.2 42.6-8.1 19-28.6 28.5-48 24.3-2.5-.5-4.9-1.1-7.2-1.8 18.5 2.1 35.8 7.1 51 14.9l3.2 16.3C306.2 445 276.3 452.5 244 452.5zM362.5 186.3c-28.2 0-51-22.8-51-51s22.8-51 51-51 51 22.8 51 51-22.8 51-51 51zm-237 0c-28.2 0-51-22.8-51-51s22.8-51 51-51 51 22.8 51 51-22.8 51-51 51z"></path>
    </svg>
);


export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<LoginValues>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    });

    const handleUserCreation = async (user: User) => {
        if (!firestore) return;
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            // User is new, create a profile
            const userProfile = {
                email: user.email,
                fullName: user.displayName,
                role: 'personal',
                companyName: null,
            };
            await setDoc(userRef, userProfile);
        }
        router.push('/dashboard');
    }

    async function onSubmit(data: LoginValues) {
        setIsLoading(true);
        if (!auth) {
            toast({
                variant: "destructive",
                title: "Error de configuración",
                description: "El servicio de autenticación no está disponible.",
            });
            setIsLoading(false);
            return;
        }
        try {
            await signInWithEmailAndPassword(auth, data.email, data.password);
            router.push('/dashboard');
        } catch (error: any) {
             let description = "Ocurrió un error inesperado.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                description = "Credenciales inválidas. Por favor, verifica tu correo y contraseña.";
            }
            toast({
                variant: "destructive",
                title: "Error al iniciar sesión",
                description,
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        if (!auth) {
            toast({ variant: 'destructive', title: 'Error de configuración', description: 'El servicio de autenticación no está disponible.' });
            setIsGoogleLoading(false);
            return;
        }
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            await handleUserCreation(result.user);
        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Error con Google",
                description: "No se pudo iniciar sesión con Google. Inténtalo de nuevo.",
            });
        } finally {
            setIsGoogleLoading(false);
        }
    }


  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Iniciar Sesión</CardTitle>
                    <CardDescription>
                    Elige tu método preferido para acceder a tu cuenta.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                     <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn} disabled={isGoogleLoading || isLoading}>
                        {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                        Continuar con Google
                    </Button>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                O continuar con
                            </span>
                        </div>
                    </div>
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Correo Electrónico</FormLabel>
                                <FormControl>
                                    <Input placeholder="nombre@ejemplo.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contraseña</FormLabel>
                                <div className="relative">
                                    <FormControl>
                                        <Input type={showPassword ? "text" : "password"} {...field} />
                                    </FormControl>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-300 ease-in-out hover:scale-110 active:scale-90"
                                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5 transition-transform duration-300 rotate-y-180" /> : <Eye className="h-5 w-5 transition-transform duration-300" />}
                                    </button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full" type="submit" disabled={isLoading || isGoogleLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Iniciar Sesión con Correo
                    </Button>
                    <div className="text-center text-sm">
                    ¿No tienes una cuenta?{" "}
                    <Link href="/auth/register" className="underline">
                        Regístrate
                    </Link>
                    </div>
                </CardFooter>
            </Card>
        </form>
      </Form>
  )
}
