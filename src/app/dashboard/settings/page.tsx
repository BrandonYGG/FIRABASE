
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore } from "@/firebase";
import { doc, updateDoc } from 'firebase/firestore';
import { Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { updateProfile } from "firebase/auth";
import { avatars } from "@/lib/data/avatars";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState('');

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');
            setSelectedAvatarUrl(user.photoURL || null);
        }
    }, [user]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user || !firestore) {
            toast({ title: "Error", description: "Servicios de Firebase no disponibles.", variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);

        const nameChanged = displayName !== (user.displayName || '');
        const avatarChanged = selectedAvatarUrl !== (user.photoURL || null);

        if (!nameChanged && !avatarChanged) {
            toast({ title: "Sin cambios", description: "No has modificado tu nombre ni tu avatar." });
            setIsSubmitting(false);
            return;
        }

        try {
            const authUpdates: { displayName?: string; photoURL?: string } = {};
            const firestoreUpdates: { displayName?: string; photoURL?: string } = {};

            if (nameChanged) {
                authUpdates.displayName = displayName;
                firestoreUpdates.displayName = displayName;
            }
            if (avatarChanged && selectedAvatarUrl) {
                authUpdates.photoURL = selectedAvatarUrl;
                firestoreUpdates.photoURL = selectedAvatarUrl;
            }

            // Update Auth Profile
            if (Object.keys(authUpdates).length > 0) {
                await updateProfile(user, authUpdates);
            }
            
            // Update Firestore Document
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
                    Actualiza tu nombre y elige un avatar para tu perfil.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre Completo o de Empresa</Label>
                        <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                        <p className="text-sm text-muted-foreground">Este es tu correo electrónico: {user.email}</p>
                    </div>

                    <div className="space-y-4">
                        <Label>Elige tu Avatar</Label>
                        <div className="grid grid-cols-6 sm:grid-cols-8 gap-3">
                            {avatars.map((avatar) => (
                                <button
                                    key={avatar.id}
                                    type="button"
                                    onClick={() => setSelectedAvatarUrl(avatar.url)}
                                    className={cn(
                                        "rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-transform hover:scale-105",
                                        selectedAvatarUrl === avatar.url && "ring-2 ring-primary ring-offset-2 scale-105"
                                    )}
                                >
                                    <Avatar className="h-16 w-16 border">
                                        <AvatarImage src={avatar.url} alt={`Avatar ${avatar.id}`} className="object-cover" />
                                        <AvatarFallback>{avatar.id}</AvatarFallback>
                                    </Avatar>
                                </button>
                            ))}
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
