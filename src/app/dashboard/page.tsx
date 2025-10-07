'use client';

import Link from 'next/link';
import { ArrowUpRight, DollarSign, ListOrdered, FilePlus2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';


const chartData = [
  { month: 'Enero', orders: 186 },
  { month: 'Febrero', orders: 305 },
  { month: 'Marzo', orders: 237 },
  { month: 'Abril', orders: 273 },
  { month: 'Mayo', orders: 209 },
  { month: 'Junio', orders: 214 },
];

const chartConfig = {
  orders: {
    label: 'Pedidos',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const recentOrders = [
    { id: 'ORD001', obra: 'Edificio Central', total: 'S/ 2,500.00', status: 'Entregado', date: '2023-06-23' },
    { id: 'ORD002', obra: 'Residencial Los Álamos', total: 'S/ 1,500.00', status: 'En proceso', date: '2023-06-24' },
    { id: 'ORD003', obra: 'Centro Comercial del Sur', total: 'S/ 3,250.50', status: 'Pendiente', date: '2023-06-25' },
    { id: 'ORD004', obra: 'Viaducto Metropolitano', total: 'S/ 7,800.00', status: 'Entregado', date: '2023-06-26' },
    { id: 'ORD005', obra: 'Hospital Regional', total: 'S/ 1,200.75', status: 'Cancelado', date: '2023-06-27' },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pedidos Totales
            </CardTitle>
            <ListOrdered className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +20.1% desde el mes pasado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monto Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/ 45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +180.1% desde el mes pasado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
            <FilePlus2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+57</div>
            <p className="text-xs text-muted-foreground">+19 desde la semana pasada</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pedidos en Proceso
            </CardTitle>
            <ListOrdered className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+23</div>
            <p className="text-xs text-muted-foreground">
              +5 desde ayer
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Resumen de Pedidos</CardTitle>
            <CardDescription>Últimos 6 meses.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="orders" fill="var(--color-orders)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
            <CardDescription>
              Los 5 pedidos más recientes.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Obra</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                   <TableHead className="hidden sm:table-cell">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map(order => (
                    <TableRow key={order.id}>
                        <TableCell>
                            <div className="font-medium">{order.obra}</div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                                {order.id}
                            </div>
                        </TableCell>
                        <TableCell className="text-right">{order.total}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                            <Badge className="text-xs" variant={order.status === 'Entregado' ? 'secondary' : order.status === 'Cancelado' ? 'destructive' : 'default'}>
                                {order.status}
                            </Badge>
                        </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
