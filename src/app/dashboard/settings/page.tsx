
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";
import { Camera, Loader2 } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
    const { user, isUserLoading } = useUser();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || user.email || '');
            setAvatarPreview(user.photoURL || null);
        }
    }, [user]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);

        // Here you would typically update the user profile in Firebase
        // For now, we'll just simulate an API call
        console.log("Updating profile with:", { displayName, avatarPreview });
        await new Promise(resolve => setTimeout(resolve, 1000));

        setIsSubmitting(false);
        toast({
            title: "Perfil Actualizado",
            description: "Tu información ha sido guardada con éxito.",
        });
    };

    if (isUserLoading) {
        return (
             <div className="max-w-2xl mx-auto">
                <Skeleton className="h-10 w-3/5 mb-6" />
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
                                <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
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
                             <Label htmlFor="name">Nombre Completo</Label>
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
