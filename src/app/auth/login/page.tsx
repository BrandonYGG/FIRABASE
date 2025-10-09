
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
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link"
import { useState } from "react";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Iniciar Sesión</CardTitle>
        <CardDescription>
          Ingresa tu correo electrónico para acceder a tu cuenta.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input id="email" type="email" placeholder="nombre@ejemplo.com" required defaultValue="usuario@ejemplo.com" />
        </div>
        <div className="relative grid gap-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type={showPassword ? "text" : "password"} required defaultValue="password" />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-muted-foreground transition-all duration-300 ease-in-out hover:scale-110 active:scale-90"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="h-5 w-5 transition-transform duration-300 rotate-y-180" /> : <Eye className="h-5 w-5 transition-transform duration-300" />}
              </button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button className="w-full" asChild>
          <Link href="/dashboard">Iniciar Sesión</Link>
        </Button>
        <div className="text-center text-sm">
          ¿No tienes una cuenta?{" "}
          <Link href="/auth/register" className="underline">
            Regístrate
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
