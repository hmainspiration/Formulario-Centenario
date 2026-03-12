import React, { useEffect, useState } from 'react';
import { Order } from '../types';
import { LogOut, RefreshCw, Download, FileText, BarChart3, Package, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminPanelProps {
  token: string;
  onLogout: () => void;
}

export default function AdminPanel({ token, onLogout }: AdminPanelProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'summary'>('orders');
  
  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('centenario_orders')
        .select(`
          *,
          items:centenario_order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      // Fetch reports summary
      const { data: allOrders, error: revError } = await supabase
        .from('centenario_orders')
        .select('total_amount');
      
      if (revError) throw revError;
      const totalRevenue = allOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      const { data: allItems, error: itemsError } = await supabase
        .from('centenario_order_items')
        .select('product_type, size, quantity');
      
      if (itemsError) throw itemsError;

      const summaryMap = new Map();
      allItems?.forEach(item => {
        const key = `${item.product_type}|${item.size || ''}`;
        if (!summaryMap.has(key)) {
          summaryMap.set(key, { product_type: item.product_type, size: item.size, total_qty: 0 });
        }
        summaryMap.get(key).total_qty += item.quantity;
      });

      const itemsSummary = Array.from(summaryMap.values());
      
      setReports({ totalRevenue, itemsSummary });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    setIsDeleting(true);
    try {
      // Delete items first to avoid foreign key constraint issues
      const { error: itemsError } = await supabase
        .from('centenario_order_items')
        .delete()
        .eq('order_id', orderId);
      
      if (itemsError) throw itemsError;

      // Delete the order
      const { error: orderError } = await supabase
        .from('centenario_orders')
        .delete()
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Refresh data
      await fetchData();
      setDeletingId(null);
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error al eliminar el pedido. Verifica los permisos.');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Panel de Administración</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gestión de pedidos Centenario 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-xl transition-colors"
            title="Actualizar"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl w-fit transition-colors">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
            activeTab === 'orders' 
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Lista de Pedidos
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
            activeTab === 'summary' 
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Resumen Total
        </button>
      </div>

      {activeTab === 'summary' && reports && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-600 dark:bg-indigo-500 text-white p-6 rounded-2xl shadow-sm transition-colors">
            <p className="text-indigo-100 font-medium mb-1">Recaudación Total</p>
            <h3 className="text-4xl font-bold">C$ {reports.totalRevenue.toLocaleString()}</h3>
          </div>
          
          <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Resumen de Artículos
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Producto</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400">Talla</th>
                    <th className="pb-3 font-medium text-gray-500 dark:text-gray-400 text-right">Cantidad Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  {reports.itemsSummary.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="py-3 text-gray-900 dark:text-gray-100 font-medium">{item.product_type}</td>
                      <td className="py-3 text-gray-500 dark:text-gray-400">{item.size || '-'}</td>
                      <td className="py-3 text-gray-900 dark:text-gray-100 text-right font-semibold">{item.total_qty}</td>
                    </tr>
                  ))}
                  {reports.itemsSummary.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-gray-500 dark:text-gray-400">
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400">ID</th>
                  <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400">Cliente</th>
                  <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400">Iglesia</th>
                  <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400">Artículos</th>
                  <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-right">Total</th>
                  <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-right">Fecha</th>
                  <th className="py-4 px-6 font-medium text-gray-500 dark:text-gray-400 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-4 px-6 text-gray-500 dark:text-gray-400">#{order.id}</td>
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">{order.customer_name}</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300">{order.church}</td>
                    <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                      {order.items.map((item, i) => (
                        <div key={i}>
                          {item.quantity}x {item.product_type} {item.size ? `(${item.size})` : ''}
                        </div>
                      ))}
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-900 dark:text-gray-100 text-right">C$ {order.total_amount}</td>
                    <td className="py-4 px-6 text-gray-500 dark:text-gray-400 text-right text-sm">
                      {new Date(order.created_at!).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {deletingId === order.id ? (
                        <div className="flex flex-col items-end gap-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-800/30">
                          <span className="text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">Nota: Borrar Pedido Ficticio</span>
                          <span className="text-xs text-red-500 dark:text-red-300 mb-1">¿Estás seguro?</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setDeletingId(null)}
                              disabled={isDeleting}
                              className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              Cancelar
                            </button>
                            <button 
                              onClick={() => handleDeleteOrder(order.id!)}
                              disabled={isDeleting}
                              className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                            >
                              {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirmar'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setDeletingId(order.id!)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Borrar pedido"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500 dark:text-gray-400">
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
