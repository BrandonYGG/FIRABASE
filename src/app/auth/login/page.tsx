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
    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <path fill="#4285F4" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#34A853" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l5.657,5.657C43.35,35.619,44,30.013,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FBBC05" d="M16.039,28.845C17.961,30.846,20.842,32,24,32l-5.657,5.657C12.35,35.619,8.862,30.013,8.862,24c0-1.341,0.138-2.65,0.389-3.917l5.488,5.488C14.039,26.155,14.039,27.845,16.039,28.845z"></path>
        <path fill="#EA4335" d="M24,16c-3.059,0-5.842,1.154-7.961,3.039l-5.657-5.657C14.046,6.053,18.828,4,24,4l5.657,5.657C28.08,8.154,26.039,8.155,24,8z"></path>
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
