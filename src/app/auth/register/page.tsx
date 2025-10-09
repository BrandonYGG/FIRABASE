
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
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <Tabs defaultValue="personal" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="personal">Personal</TabsTrigger>
        <TabsTrigger value="empresa">Empresa</TabsTrigger>
      </TabsList>
      <TabsContent value="personal">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Registro Personal</CardTitle>
            <CardDescription>
              Crea tu cuenta para gestionar tus pedidos personales.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="personal-name">Nombre Completo</Label>
              <Input id="personal-name" placeholder="Juan Pérez" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personal-email">Correo Electrónico</Label>
              <Input id="personal-email" placeholder="nombre@ejemplo.com" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personal-password">Contraseña</Label>
              <Input id="personal-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personal-confirm-password">Confirmar Contraseña</Label>
              <Input id="personal-confirm-password" type="password" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full">Crear Cuenta Personal</Button>
             <div className="text-center text-sm">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/auth/login" className="underline">
                    Iniciar Sesión
                </Link>
            </div>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="empresa">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Registro de Empresa</CardTitle>
            <CardDescription>
              Registra tu empresa para centralizar todos los pedidos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nombre de la Empresa</Label>
              <Input id="company-name" placeholder="Constructora S.A." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legal-representative">Representante Legal</Label>
              <Input id="legal-representative" placeholder="Juan Pérez" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-rfc">RFC</Label>
              <Input id="company-rfc" placeholder="XAXX010101000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-phone">Número Telefónico</Label>
              <Input id="company-phone" placeholder="55 1234 5678" type="tel" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="company-email">Correo Electrónico de la Empresa</Label>
              <Input id="company-email" placeholder="contacto@constructora.com" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-password">Contraseña</Label>
              <Input id="company-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-confirm-password">Confirmar Contraseña</Label>
              <Input id="company-confirm-password" type="password" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full">Crear Cuenta de Empresa</Button>
             <div className="text-center text-sm">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/auth/login" className="underline">
                    Iniciar Sesión
                </Link>
            </div>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
