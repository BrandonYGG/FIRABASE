
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Camera, Loader2 } from "lucide-react";
import React, { useState, useRef } from "react";

export default function SettingsPage() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState("https://upload.wikimedia.org/wikipedia/en/3/34/Jimmy_McGill_BCS_S3.png");
    const fileInputRef = useRef<HTMLInputElement>(null);

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

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 200));

        setIsSubmitting(false);
        toast({
            title: "Perfil Actualizado",
            description: "Tu información ha sido guardada con éxito.",
        });
    };

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
                                <AvatarImage src={avatarPreview} alt="Avatar de usuario" className="object-contain" />
                                <AvatarFallback>JM</AvatarFallback>
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
                             <Input id="name" defaultValue="James Morgan McGill" />
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
