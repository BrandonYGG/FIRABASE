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
    <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <path fill="#4285F4" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#34A853" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l5.657,5.657C43.35,35.619,44,30.013,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FBBC05" d="M16.039,28.845C17.961,30.846,20.842,32,24,32l-5.657,5.657C12.35,35.619,8.862,30.013,8.862,24c0-1.341,0.138-2.65,0.389-3.917l5.488,5.488C14.039,26.155,14.039,27.845,16.039,28.845z"></path>
        <path fill="#EA4335" d="M24,16c-3.059,0-5.842,1.154-7.961,3.039l-5.657-5.657C14.046,6.053,18.828,4,24,4l5.657,5.657C28.08,8.154,26.039,8.155,24,8z"></path>
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
