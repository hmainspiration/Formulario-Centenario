/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import OrderForm from './components/OrderForm';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import { OrderItem } from './types';
import { ClipboardList, BarChart2 } from 'lucide-react';
import { supabase } from './lib/supabase';

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'admin'>('form');
  const [adminToken, setAdminToken] = useState<string | null>(null);

  const handleSaveOrder = async (customerName: string, church: string, items: OrderItem[], totalAmount: number) => {
    // Insert Order
    const { data: order, error: orderError } = await supabase
      .from('centenario_orders')
      .insert([{ customer_name: customerName, church, total_amount: totalAmount }])
      .select()
      .single();

    if (orderError) throw orderError;

    const orderId = order.id;

    // Prepare items
    const itemsToInsert = items.map((item: any) => ({
      order_id: orderId,
      product_type: item.product_type,
      design: item.design,
      size: item.size || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal
    }));

    // Insert Items
    const { error: itemsError } = await supabase
      .from('centenario_order_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
              C
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 hidden sm:block">
              Centenario 2026
            </h1>
          </div>

          <nav className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
                activeTab === 'form' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Pedido</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
                activeTab === 'admin' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span className="hidden sm:inline">Reportes</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="py-8 px-4">
        {activeTab === 'form' ? (
          <OrderForm onSave={handleSaveOrder} />
        ) : adminToken ? (
          <AdminPanel token={adminToken} onLogout={() => setAdminToken(null)} />
        ) : (
          <Login onLogin={setAdminToken} />
        )}
      </main>
    </div>
  );
}
