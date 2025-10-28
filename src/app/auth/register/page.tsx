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
import { Separator } from "@/components/ui/separator";

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512S0 403.3 0 261.8C0 120.3 106.5 8 244 8s244 112.3 244 253.8zM88 261.8c0 110.6 73.4 201.3 166 201.3s166-90.7 166-201.3S369.4 60.5 254 60.5 88 151.2 88 261.8zM244 452.5c-32.3 0-62.2-7.5-88.6-20.4l3.2-16.3c15.2-7.8 32.4-12.8 51-14.9-2.3.7-4.7 1.3-7.2 1.8-19.4 4.2-39.8-5.3-48-24.3-7-16.3-.7-35.6 15.2-42.6 16.3-7 35.6-.7 42.6 15.2 2.9 6.7 3.5 13.9 1.9 20.8 14.3-3 29.5-4.6 45.4-4.6 15.9 0 31.1 1.6 45.4 4.6-1.6-6.9-1-14.1 1.9-20.8 7-16 26.3-22.2 42.6-15.2 16 7 22.2 26.3 15.2 42.6-8.1 19-28.6 28.5-48 24.3-2.5-.5-4.9-1.1-7.2-1.8 18.5 2.1 35.8 7.1 51 14.9l3.2 16.3C306.2 445 276.3 452.5 244 452.5zM362.5 186.3c-28.2 0-51-22.8-51-51s22.8-51 51-51 51 22.8 51 51-22.8 51-51 51zm-237 0c-28.2 0-51-22.8-51-51s22.8-51 51-51 51 22.8 51 51-22.8 51-51 51z"></path>
    </svg>
);


type PersonalFormValues = z.infer<typeof PersonalRegistrationSchema>;
type CompanyFormValues = z.infer<typeof CompanyRegistrationSchema>;

export default function RegisterPage() {
    const [showPersonalPassword, setShowPersonalPassword] = useState(false);
    const [showPersonalConfirmPassword, setShowPersonalConfirmPassword] = useState(false);
    const [showCompanyPassword, setShowCompanyPassword] = useState(false);
    const [showCompanyConfirmPassword, setShowCompanyConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    
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
            legalRepresentative: '',
            rfc: '',
            phone: '',
            email: '',
            password: '',
            confirmPassword: '',
        }
    });

     const handleUserCreation = async (user: User, role: 'personal' | 'company' = 'personal', extraData: Record<string, any> = {}) => {
        if (!firestore) return;
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            let profileData: any;
            if (role === 'company') {
                profileData = {
                    email: user.email,
                    role: 'company',
                    ...extraData
                };
            } else {
                 profileData = {
                    email: user.email,
                    fullName: user.displayName || extraData.fullName,
                    role: 'personal',
                };
            }
            await setDoc(userRef, profileData);
        }
        router.push('/dashboard');
    }

    const handleRegistration = async (data: PersonalFormValues | CompanyFormValues, role: 'personal' | 'company') => {
        setIsSubmitting(true);
        if (!auth || !firestore) {
            toast({ variant: 'destructive', title: 'Error de configuración', description: 'Los servicios de Firebase no están disponibles.' });
            setIsSubmitting(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const user = userCredential.user;

            const displayName = role === 'company' ? (data as CompanyFormValues).companyName : (data as PersonalFormValues).fullName;
            await updateProfile(user, { displayName });

            const userProfileRef = doc(firestore, 'users', user.uid);
            
            let userProfileData: any;
            if (role === 'company') {
                const companyData = data as CompanyFormValues;
                userProfileData = {
                    companyName: companyData.companyName,
                    legalRepresentative: companyData.legalRepresentative,
                    rfc: companyData.rfc,
                    phone: companyData.phone,
                    email: companyData.email,
                    role: 'company'
                };
            } else {
                const personalData = data as PersonalFormValues;
                userProfileData = {
                    fullName: personalData.fullName,
                    email: personalData.email,
                    role: 'personal'
                };
            }
            
            await setDoc(userProfileRef, userProfileData);

            router.push('/dashboard');

        } catch (error: any) {
            console.error("Registration Error:", error);
            let errorMessage = "Ocurrió un error inesperado durante el registro.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Este correo electrónico ya está en uso. Por favor, intenta con otro.';
            } else if (error.code === 'permission-denied') {
                errorMessage = 'No tienes permiso para realizar esta acción. Revisa las reglas de seguridad.';
            }
            toast({ variant: 'destructive', title: 'Error de Registro', description: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    }


    async function onPersonalSubmit(data: PersonalFormValues) {
        await handleRegistration(data, 'personal');
    }

    async function onCompanySubmit(data: CompanyFormValues) {
        await handleRegistration(data, 'company');
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
                description: "No se pudo registrar con Google. Inténtalo de nuevo.",
            });
        } finally {
            setIsGoogleLoading(false);
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
                 <Button variant="outline" className="w-full" type="button" onClick={handleGoogleSignIn} disabled={isGoogleLoading || isSubmitting}>
                    {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
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
                <Button className="w-full" type="submit" disabled={isSubmitting || isGoogleLoading}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                      name="legalRepresentative"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Representante Legal</FormLabel>
                          <FormControl>
                            <Input placeholder="Juan Pérez" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
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
                      <FormLabel>Confirmar Contraseña</FormLabel>
                       <div className="relative">
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
                <Button className="w-full" type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
