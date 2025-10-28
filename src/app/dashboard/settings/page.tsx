
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useStorage } from "@/firebase";
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Camera, Loader2 } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { updateProfile } from "firebase/auth";

export default function SettingsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const storage = useStorage();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');
            setAvatarPreview(user.photoURL || null);
        }
    }, [user]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user || !firestore || !storage) {
            toast({ title: "Error", description: "Servicios de Firebase no disponibles.", variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);

        const nameChanged = displayName !== (user.displayName || '');
        const avatarChanged = avatarFile !== null;

        if (!nameChanged && !avatarChanged) {
            toast({ title: "Sin cambios", description: "No has modificado tu nombre ni tu foto." });
            setIsSubmitting(false);
            return;
        }

        try {
            let photoURL: string | undefined = undefined;

            // 1. Upload avatar if it changed
            if (avatarFile) {
                const storageRef = ref(storage, `profile-pictures/${user.uid}/${avatarFile.name}`);
                const uploadResult = await uploadBytes(storageRef, avatarFile);
                photoURL = await getDownloadURL(uploadResult.ref);
            }

            const authUpdates: { displayName?: string; photoURL?: string } = {};
            const firestoreUpdates: { displayName?: string; photoURL?: string } = {};

            if (nameChanged) {
                authUpdates.displayName = displayName;
                firestoreUpdates.displayName = displayName;
            }
            if (photoURL) {
                authUpdates.photoURL = photoURL;
                firestoreUpdates.photoURL = photoURL;
            }

            // 2. Update Auth Profile
            if (Object.keys(authUpdates).length > 0) {
                await updateProfile(user, authUpdates);
            }
            
            // 3. Update Firestore Document
            if (Object.keys(firestoreUpdates).length > 0) {
                const userRef = doc(firestore, 'users', user.uid);
                await updateDoc(userRef, firestoreUpdates);
            }
            
            toast({
                title: "Perfil Actualizado",
                description: "Tu información ha sido guardada con éxito.",
            });

        } catch (error: any) {
            console.error("Error updating profile: ", error);
            toast({
                title: "Error al actualizar",
                description: error.message || "No se pudo actualizar el perfil.",
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
            setAvatarFile(null);
        }
    };

    if (isUserLoading) {
        return (
             <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 font-headline tracking-tight">
                    Configuración de Perfil
                </h1>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-2/3 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center space-x-6">
                             <Skeleton className="h-24 w-24 rounded-full" />
                             <div className="flex-grow space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-10 w-full" />
                             </div>
                        </div>
                         <div className="flex justify-end">
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </CardContent>
                </Card>
             </div>
        )
    }

    if (!user) {
        return null; // Or a message telling the user to log in
    }

  return (
    <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 font-headline tracking-tight">
            Configuración de Perfil
        </h1>
        <Card>
            <CardHeader>
                <CardTitle>Detalles del Perfil</CardTitle>
                <CardDescription>
                    Actualiza tu nombre y foto de perfil.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            <Avatar className="h-24 w-24">
                                {avatarPreview && <AvatarImage src={avatarPreview} alt="Avatar de usuario" className="object-cover" />}
                                <AvatarFallback>{displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="icon" 
                                className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                                onClick={handleAvatarClick}
                                aria-label="Cambiar foto de perfil"
                            >
                                <Camera className="h-4 w-4"/>
                            </Button>
                            <Input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleFileChange}
                            />
                        </div>
                        <div className="flex-grow space-y-2">
                             <Label htmlFor="name">Nombre Completo o de Empresa</Label>
                             <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                             <p className="text-sm text-muted-foreground">Este es tu correo electrónico: {user.email}</p>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}
