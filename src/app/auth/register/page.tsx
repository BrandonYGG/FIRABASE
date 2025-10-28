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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PersonalRegistrationSchema, CompanyRegistrationSchema } from "@/lib/schemas";
import { useAuth, useFirestore } from '@/firebase';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider, type User } from "firebase/auth";
import type { UserProfile } from "@/lib/types";

type PersonalFormValues = z.infer<typeof PersonalRegistrationSchema>;
type CompanyFormValues = z.infer<typeof CompanyRegistrationSchema>;

export default function RegisterPage() {
    const [showPersonalPassword, setShowPersonalPassword] = useState(false);
    const [showPersonalConfirmPassword, setShowPersonalConfirmPassword] = useState(false);
    const [showCompanyPassword, setShowCompanyPassword] = useState(false);
    const [showCompanyConfirmPassword, setShowCompanyConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const auth = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();


    const personalForm = useForm<PersonalFormValues>({
        resolver: zodResolver(PersonalRegistrationSchema),
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
        }
    });

    const companyForm = useForm<CompanyFormValues>({
        resolver: zodResolver(CompanyRegistrationSchema),
        defaultValues: {
            companyName: '',
            rfc: '',
            phone: '',
            email: '',
            password: '',
            confirmPassword: '',
        }
    });

    const handleUserSession = async (user: User, role: 'personal' | 'company' = 'personal', displayName: string) => {
        if (!firestore) return;
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            const userProfile: UserProfile = {
                email: user.email!,
                displayName: displayName,
                role: role,
            };
            if(role === 'company') {
                const companyData = companyForm.getValues();
                userProfile.rfc = companyData.rfc;
                userProfile.phone = companyData.phone;
            }
            await setDoc(userRef, userProfile);
        }
        router.push('/dashboard');
    }

    const handleRegistration = async (data: PersonalFormValues | CompanyFormValues, role: 'personal' | 'company') => {
        setIsLoading(true);
        if (!auth || !firestore) {
            toast({ variant: 'destructive', title: 'Error de configuración', description: 'Los servicios de Firebase no están disponibles.' });
            setIsLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const user = userCredential.user;

            const displayName = role === 'company' ? (data as CompanyFormValues).companyName : (data as PersonalFormValues).fullName;
            await updateProfile(user, { displayName });
            
            await handleUserSession(user, role, displayName);

        } catch (error: any) {
            console.error("Registration Error:", error);
            let errorMessage = "Ocurrió un error inesperado durante el registro.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Este correo electrónico ya está en uso. Por favor, intenta con otro.';
            }
            toast({ variant: 'destructive', title: 'Error de Registro', description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    }


    async function onPersonalSubmit(data: PersonalFormValues) {
        await handleRegistration(data, 'personal');
    }

    async function onCompanySubmit(data: CompanyFormValues) {
        await handleRegistration(data, 'company');
    }

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        if (!auth) {
            toast({ variant: 'destructive', title: 'Error de configuración', description: 'El servicio de autenticación no está disponible.' });
            setIsLoading(false);
            return;
        }
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            await handleUserSession(result.user, 'personal', result.user.displayName || result.user.email!);
        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Error con Google",
                description: "No se pudo registrar con Google. Inténtalo de nuevo.",
            });
        } finally {
             setIsLoading(false);
        }
    }


  return (
    <Tabs defaultValue="personal" className="w-full max-w-lg">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="personal">Personal</TabsTrigger>
        <TabsTrigger value="empresa">Empresa</TabsTrigger>
      </TabsList>
      <TabsContent value="personal">
        <Card>
          <Form {...personalForm}>
            <form onSubmit={personalForm.handleSubmit(onPersonalSubmit)}>
              <CardHeader>
                <CardTitle className="font-headline">Registro Personal</CardTitle>
                <CardDescription>
                  Crea tu cuenta para gestionar tus pedidos personales.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Image src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png" alt="Google" width={16} height={16} className="mr-2" />}
                    Continuar con Google
                </Button>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            O regístrate con tu correo
                        </span>
                    </div>
                </div>
                <FormField
                  control={personalForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={personalForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input placeholder="nombre@ejemplo.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={personalForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                       <div className="relative">
                        <FormControl>
                            <Input type={showPersonalPassword ? "text" : "password"} {...field} className="pr-10" />
                        </FormControl>
                        <button
                            type="button"
                            onClick={() => setShowPersonalPassword(!showPersonalPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-300 ease-in-out hover:scale-110 active:scale-90"
                            aria-label={showPersonalPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            {showPersonalPassword ? <EyeOff className="h-5 w-5 transition-transform duration-300 rotate-y-180" /> : <Eye className="h-5 w-5 transition-transform duration-300" />}
                        </button>
                       </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={personalForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Contraseña</FormLabel>
                      <div className="relative">
                        <FormControl>
                            <Input type={showPersonalConfirmPassword ? "text" : "password"} {...field} className="pr-10" />
                        </FormControl>
                        <button
                            type="button"
                            onClick={() => setShowPersonalConfirmPassword(!showPersonalConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-300 ease-in-out hover:scale-110 active:scale-90"
                            aria-label={showPersonalConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            {showPersonalConfirmPassword ? <EyeOff className="h-5 w-5 transition-transform duration-300 rotate-y-180" /> : <Eye className="h-5 w-5 transition-transform duration-300" />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Crear Cuenta Personal
                </Button>
                 <div className="text-center text-sm">
                    ¿Ya tienes una cuenta?{" "}
                    <Link href="/auth/login" className="underline">
                        Iniciar Sesión
                    </Link>
                </div>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </TabsContent>
      <TabsContent value="empresa">
        <Card>
          <Form {...companyForm}>
            <form onSubmit={companyForm.handleSubmit(onCompanySubmit)}>
              <CardHeader>
                <CardTitle className="font-headline">Registro de Empresa</CardTitle>
                <CardDescription>
                  Registra tu empresa para centralizar todos los pedidos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={companyForm.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la Empresa</FormLabel>
                          <FormControl>
                            <Input placeholder="Constructora S.A." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="rfc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RFC</FormLabel>
                          <FormControl>
                            <Input placeholder="XAXX010101000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                <FormField
                  control={companyForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número Telefónico</FormLabel>
                      <FormControl>
                        <Input placeholder="55 1234 5678" type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={companyForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico de la Empresa</FormLabel>
                      <FormControl>
                        <Input placeholder="contacto@constructora.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={companyForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                       <div className="relative">
                        <FormControl>
                            <Input type={showCompanyPassword ? "text" : "password"} {...field} className="pr-10" />
                        </FormControl>
                        <button
                            type="button"
                            onClick={() => setShowCompanyPassword(!showCompanyPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-300 ease-in-out hover:scale-110 active:scale-90"
                            aria-label={showCompanyPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            {showCompanyPassword ? <EyeOff className="h-5 w-5 transition-transform duration-300 rotate-y-180" /> : <Eye className="h-5 w-5 transition-transform duration-300" />}
                        </button>
                       </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={companyForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Contraseña</FormLabel>                       <div className="relative">
                        <FormControl>
                            <Input type={showCompanyConfirmPassword ? "text" : "password"} {...field} className="pr-10" />
                        </FormControl>
                        <button
                            type="button"
                            onClick={() => setShowCompanyConfirmPassword(!showCompanyConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-300 ease-in-out hover:scale-110 active:scale-90"
                            aria-label={showCompanyConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            {showCompanyConfirmPassword ? <EyeOff className="h-5 w-5 transition-transform duration-300 rotate-y-180" /> : <Eye className="h-5 w-5 transition-transform duration-300" />}
                        </button>
                       </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Crear Cuenta de Empresa
                </Button>
                 <div className="text-center text-sm">
                    ¿Ya tienes una cuenta?{" "}
                    <Link href="/auth/login" className="underline">
                        Iniciar Sesión
                    </Link>
                </div>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
