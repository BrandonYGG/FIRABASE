
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ListOrdered, Wand2, Building, Zap, Newspaper, ScanLine } from 'lucide-react';
import Header from '@/components/layout/header';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useEffect, useState } from 'react';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-construction');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

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
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-primary-foreground/90">
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
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
                      <ScanLine className="text-primary" />
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

        <section id="ai-features" className="bg-background/50">
            <div className="container mx-auto px-4 py-16 md:py-24">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Potenciado por Inteligencia Artificial</h2>
                        <p className="text-muted-foreground text-lg mb-6">
                            Nuestra IA trabaja para ti, optimizando la logística y ofreciéndote información valiosa para tomar mejores decisiones.
                        </p>
                        <Card className="bg-accent/10 border-accent/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Wand2 className="text-accent"/>
                                    Análisis de Urgencia Inteligente
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>
                                    Al crear un pedido, nuestra IA analiza el rango de fechas de entrega y lo clasifica automáticamente como <span className="font-bold text-destructive">Urgente</span>, <span className="font-bold text-yellow-600">Pronto</span> o <span className="font-bold text-green-700">Normal</span>. Además, te proporciona sugerencias para planificar la logística, confirmar la disponibilidad de proveedores y optimizar costos de envío.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    <div>
                         {heroImage && (
                            <Image
                            src="https://picsum.photos/seed/2/600/400"
                            alt="AI helping in construction management"
                            width={600}
                            height={400}
                            className="rounded-lg shadow-xl"
                            data-ai-hint="artificial intelligence construction"
                            />
                        )}
                    </div>
                </div>
            </div>
        </section>

        <section id="news" className="container mx-auto px-4 py-16 md:py-24 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Últimas Novedades</h2>
             <p className="max-w-3xl mx-auto text-muted-foreground text-lg mb-12">
                Estamos en constante mejora para ofrecerte la mejor herramienta de gestión.
            </p>
            <Card className="max-w-2xl mx-auto text-left">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Newspaper className="text-primary"/>
                        Lanzamiento de la Plataforma
                    </CardTitle>
                    <CardDescription>
                        Octubre 2025
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>
                        ¡Estamos emocionados de lanzar la primera versión de OrderFlow Construct! Ahora puedes registrar tus pedidos, gestionar tu historial y aprovechar las primeras funcionalidades de nuestra inteligencia artificial. ¡Próximamente integraremos más características para ti!
                    </p>
                </CardContent>
            </Card>
        </section>

      </main>
      <footer className="py-6 px-4 text-center text-muted-foreground">
        © {currentYear} OrderFlow Construct. Todos los derechos reservados.
      </footer>
    </div>
  );
}
