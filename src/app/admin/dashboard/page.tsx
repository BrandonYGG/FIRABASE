'use client';
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default function AdminDashboardPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 font-headline tracking-tight">
                Panel de Administrador
            </h1>
            <AdminDashboard />
        </div>
    );
}
