import React, { useEffect, useState } from 'react';
import { Order } from '../types';
import { LogOut, RefreshCw, Download, FileText, BarChart3, Package } from 'lucide-react';

interface AdminPanelProps {
  token: string;
  onLogout: () => void;
}

export default function AdminPanel({ token, onLogout }: AdminPanelProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'summary'>('orders');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, reportsRes] = await Promise.all([
        fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/reports', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (ordersRes.ok && reportsRes.ok) {
        setOrders(await ordersRes.json());
        setReports(await reportsRes.json());
      } else {
        if (ordersRes.status === 401) onLogout();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-500 mt-1">Gestión de pedidos Centenario 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
            title="Actualizar"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
            activeTab === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          Lista de Pedidos
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
            activeTab === 'summary' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Resumen Total
        </button>
      </div>

      {activeTab === 'summary' && reports && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-sm">
            <p className="text-indigo-100 font-medium mb-1">Recaudación Total</p>
            <h3 className="text-4xl font-bold">C$ {reports.totalRevenue.toLocaleString()}</h3>
          </div>
          
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              Resumen de Artículos
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 font-medium text-gray-500">Producto</th>
                    <th className="pb-3 font-medium text-gray-500">Talla</th>
                    <th className="pb-3 font-medium text-gray-500 text-right">Cantidad Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reports.itemsSummary.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 text-gray-900 font-medium">{item.product_type}</td>
                      <td className="py-3 text-gray-500">{item.size || '-'}</td>
                      <td className="py-3 text-gray-900 text-right font-semibold">{item.total_qty}</td>
                    </tr>
                  ))}
                  {reports.itemsSummary.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-gray-500">
                        No hay artículos registrados aún.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-4 px-6 font-medium text-gray-500">ID</th>
                  <th className="py-4 px-6 font-medium text-gray-500">Cliente</th>
                  <th className="py-4 px-6 font-medium text-gray-500">Iglesia</th>
                  <th className="py-4 px-6 font-medium text-gray-500">Artículos</th>
                  <th className="py-4 px-6 font-medium text-gray-500 text-right">Total</th>
                  <th className="py-4 px-6 font-medium text-gray-500 text-right">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-gray-500">#{order.id}</td>
                    <td className="py-4 px-6 font-medium text-gray-900">{order.customer_name}</td>
                    <td className="py-4 px-6 text-gray-600">{order.church}</td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {order.items.map((item, i) => (
                        <div key={i}>
                          {item.quantity}x {item.product_type} {item.size ? `(${item.size})` : ''}
                        </div>
                      ))}
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-900 text-right">C$ {order.total_amount}</td>
                    <td className="py-4 px-6 text-gray-500 text-right text-sm">
                      {new Date(order.created_at!).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      No hay pedidos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
