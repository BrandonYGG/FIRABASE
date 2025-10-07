import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ListOrdered } from 'lucide-react';
import Header from '@/components/layout/header';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-primary-foreground/90">
              Digitalizando la gestión de materiales para su obra.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="text-primary" />
                  Registrar Nuevo Pedido
                </CardTitle>
                <CardDescription>
                  Inicie un nuevo pedido de materiales de forma rápida y sencilla.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Complete nuestro formulario detallado para asegurar que su pedido sea procesado con precisión.
                </p>
                <Button asChild className="w-full md:w-auto">
                  <Link href="/pedidos/nuevo">Crear Pedido</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListOrdered className="text-primary" />
                  Ver Pedidos Anteriores
                </CardTitle>
                <CardDescription>
                  Consulte el historial y estado de todos sus pedidos registrados.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Filtre y busque pedidos por fecha, obra o estado para un seguimiento eficiente.
                </p>
                <Button asChild variant="secondary" className="w-full md:w-auto">
                  <Link href="/pedidos">Ver Historial</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <footer className="py-6 px-4 text-center text-muted-foreground">
        © {new Date().getFullYear()} OrderFlow Construct. Todos los derechos reservados.
      </footer>
    </div>
  );
}
