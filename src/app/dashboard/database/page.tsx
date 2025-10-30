'use client'

import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, collectionGroup, getDocs, query, Query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { UserProfile, Order } from "@/lib/types";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

type WithId<T> = T & { id: string };

function DataViewer<T>({ title, data, loading, columns }: { title: string, data: WithId<T>[] | null, loading: boolean, columns: (keyof T | 'id')[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map(col => <TableHead key={String(col)}>{String(col)}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <TableRow key={i}>
                                    {columns.map(col => <TableCell key={String(col)}><Skeleton className="h-5" /></TableCell>)}
                                </TableRow>
                            ))
                        ) : data && data.length > 0 ? (
                            data.map((item) => (
                                <TableRow key={item.id}>
                                    {columns.map(col => {
                                        const value = item[col as keyof typeof item];
                                        if (value instanceof Date) {
                                            return <TableCell key={String(col)}>{value.toLocaleString()}</TableCell>;
                                        }
                                        if (typeof value === 'object' && value !== null) {
                                            return <TableCell key={String(col)}><pre className="text-xs">{JSON.stringify(value, null, 2)}</pre></TableCell>;
                                        }
                                        return <TableCell key={String(col)}>{String(value)}</TableCell>;
                                    })}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No hay datos para mostrar.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}


export default function DatabasePage() {
    const firestore = useFirestore();
    
    // Hook for users
    const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
    const { data: users, isLoading: usersLoading, error: usersError } = useCollection<UserProfile>(usersQuery);

    // State and effect for orders
    const [orders, setOrders] = useState<WithId<Order>[] | null>(null);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersError, setOrdersError] = useState<Error | null>(null);

    useEffect(() => {
        if (!firestore) return;

        const fetchOrders = async () => {
            setOrdersLoading(true);
            try {
                const ordersGroupQuery = collectionGroup(firestore, 'pedidos');
                const querySnapshot = await getDocs(ordersGroupQuery);
                const fetchedOrders = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as WithId<Order>));
                setOrders(fetchedOrders);
            } catch (err: any) {
                setOrdersError(err);
            } finally {
                setOrdersLoading(false);
            }
        };

        fetchOrders();
    }, [firestore]);


    if(usersError || ordersError) {
        return (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error al cargar datos</AlertTitle>
                <AlertDescription>
                    {usersError?.message || ordersError?.message}
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                 <h1 className="text-3xl font-bold mb-2 font-headline tracking-tight">
                    Explorador de Base de Datos
                </h1>
                <p className="text-muted-foreground">
                    Una vista en tiempo real de las colecciones principales en Firestore.
                </p>
            </div>
            
            <DataViewer<UserProfile> 
                title="Perfiles de Usuario"
                data={users}
                loading={usersLoading}
                columns={['id', 'displayName', 'email', 'role', 'phone', 'rfc']}
            />
            
            <DataViewer<Order>
                title="Pedidos"
                data={orders}
                loading={ordersLoading}
                columns={['id', 'obra', 'solicitante', 'status', 'total', 'userId']}
            />
        </div>
    );
}