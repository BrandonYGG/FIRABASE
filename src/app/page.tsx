
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ListOrdered, Zap, Building, Smartphone } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Header from '@/components/layout/header';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-construction');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="relative w-full h-[50vh] min-h-[300px] flex items-center justify-center text-center text-white overflow-hidden">
          {heroImage && (
             <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 p-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              OrderFlow Construct
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-white">
              Digitalizando la gestión de materiales para su obra.
            </p>
             <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                    <Link href="/auth/login">
                        <ArrowRight className="mr-2" /> Crear Pedido
                    </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                    <Link href="/auth/login">Iniciar Sesión</Link>
                </Button>
            </div>
          </div>
        </section>
        
        <section id="features" className="container mx-auto px-4 py-16 md:py-24 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Una plataforma, todo el control</h2>
            <p className="max-w-3xl mx-auto text-muted-foreground text-lg mb-12">
                Desde la solicitud hasta la entrega, OrderFlow Construct centraliza y simplifica cada paso del proceso de adquisición de materiales.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                <Card className="hover:shadow-lg transition-shadow duration-300 text-left">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="text-primary" />
                      Pedidos Simplificados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Crea nuevos pedidos de materiales en minutos con nuestro formulario inteligente y fácil de usar.
                    </p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow duration-300 text-left">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ListOrdered className="text-primary" />
                      Seguimiento Centralizado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Consulta el historial y estado de todos tus pedidos en un solo lugar, con filtros para una búsqueda eficiente.
                    </p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow duration-300 text-left">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="text-primary" />
                      Gestión para Empresas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Registra tu empresa y gestiona los pedidos de múltiples obras y solicitantes desde una única cuenta.
                    </p>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow duration-300 text-left">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="text-primary" />
                      Interfaz Intuitiva
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Diseñada para ser fácil de usar en cualquier dispositivo, permitiéndote gestionar tus pedidos sin complicaciones.
                    </p>
                  </CardContent>
                </Card>
            </div>
        </section>

        <section id="news" className="bg-muted py-16 md:py-24">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">Últimas Novedades</h2>
                <div className="relative max-w-2xl mx-auto">
                    <div className="absolute left-1/2 w-0.5 h-full bg-border -translate-x-1/2"></div>
                    <div className="relative">
                        <div className="absolute left-1/2 top-4 w-4 h-4 bg-primary rounded-full border-4 border-background -translate-x-1/2"></div>
                        <div className="ml-auto md:ml-0 md:w-1/2 md:pl-8 text-left">
                            <Card className="ml-4 md:ml-0">
                                <CardHeader>
                                    <CardTitle>Lanzamiento de la Plataforma</CardTitle>
                                    <p className="text-sm text-muted-foreground">Octubre 2025</p>
                                </CardHeader>
                                <CardContent>
                                    <p>¡Estamos emocionados de lanzar la primera versión de OrderFlow Construct! Ahora puedes registrar tus pedidos, gestionar tu historial y aprovechar las primeras funcionalidades de nuestra inteligencia artificial. ¡Próximamente integraremos más características para ti!</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </section>

      </main>
      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
            <p>&copy; 2025 OrderFlow Construct. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
