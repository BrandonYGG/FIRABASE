
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ListOrdered, Zap } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Header from '@/components/layout/header';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-construction');
  const currentYear = new Date().getFullYear();

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
            </div>
        </section>
      </main>
      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
            <p>&copy; {currentYear} OrderFlow Construct. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
