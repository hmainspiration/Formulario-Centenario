import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

const supabaseUrl = 'https://gciwhtxjwqwblnhwlgtb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjaXdodHhqd3F3YmxuaHdsZ3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjY1MjIsImV4cCI6MjA3NTYwMjUyMn0.d8EI8ArxmYiiZQKsvXVT9g-VzZcyyAYXciSoDPiIbN4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === 'centenario2026') {
      res.json({ success: true, token: 'admin-token-123' });
    } else {
      res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }
  });

  app.post('/api/orders', async (req, res) => {
    const { customer_name, church, items, total_amount } = req.body;
    
    if (!customer_name || !church || !items || items.length === 0) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    try {
      // Insert Order
      const { data: order, error: orderError } = await supabase
        .from('centenario_orders')
        .insert([{ customer_name, church, total_amount }])
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

      res.json({ success: true, orderId });
    } catch (error) {
      console.error('Error saving order:', error);
      res.status(500).json({ error: 'Error al guardar el pedido' });
    }
  });

  app.get('/api/orders', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== 'Bearer admin-token-123') {
      return res.status(401).json({ error: 'No autorizado' });
    }

    try {
      const { data: orders, error } = await supabase
        .from('centenario_orders')
        .select(`
          *,
          items:centenario_order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Error al obtener los pedidos' });
    }
  });

  app.get('/api/reports', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== 'Bearer admin-token-123') {
      return res.status(401).json({ error: 'No autorizado' });
    }

    try {
      // Get total revenue
      const { data: orders, error: ordersError } = await supabase
        .from('centenario_orders')
        .select('total_amount');

      if (ordersError) throw ordersError;

      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      // Get items summary
      const { data: items, error: itemsError } = await supabase
        .from('centenario_order_items')
        .select('product_type, size, quantity');

      if (itemsError) throw itemsError;

      const summaryMap = new Map();
      items?.forEach(item => {
        const key = `${item.product_type}|${item.size || ''}`;
        if (!summaryMap.has(key)) {
          summaryMap.set(key, { product_type: item.product_type, size: item.size, total_qty: 0 });
        }
        summaryMap.get(key).total_qty += item.quantity;
      });

      const itemsSummary = Array.from(summaryMap.values());

      res.json({
        totalRevenue,
        itemsSummary
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ error: 'Error al obtener los reportes' });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
