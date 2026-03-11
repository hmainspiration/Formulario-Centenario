import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('orders.db');

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    church TEXT NOT NULL,
    total_amount REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_type TEXT NOT NULL,
    design TEXT NOT NULL,
    size TEXT,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id)
  );
`);

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

  app.post('/api/orders', (req, res) => {
    const { customer_name, church, items, total_amount } = req.body;
    
    if (!customer_name || !church || !items || items.length === 0) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const insertOrder = db.prepare('INSERT INTO orders (customer_name, church, total_amount) VALUES (?, ?, ?)');
    const insertItem = db.prepare('INSERT INTO order_items (order_id, product_type, design, size, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)');

    const transaction = db.transaction(() => {
      const info = insertOrder.run(customer_name, church, total_amount);
      const orderId = info.lastInsertRowid;

      for (const item of items) {
        insertItem.run(orderId, item.product_type, item.design, item.size || null, item.quantity, item.unit_price, item.subtotal);
      }
      return orderId;
    });

    try {
      const orderId = transaction();
      res.json({ success: true, orderId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al guardar el pedido' });
    }
  });

  app.get('/api/orders', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== 'Bearer admin-token-123') {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    const items = db.prepare('SELECT * FROM order_items').all();

    const ordersWithItems = orders.map((order: any) => ({
      ...order,
      items: items.filter((item: any) => item.order_id === order.id)
    }));

    res.json(ordersWithItems);
  });

  app.get('/api/reports', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== 'Bearer admin-token-123') {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const totalRevenue = db.prepare('SELECT SUM(total_amount) as total FROM orders').get() as {total: number};
    const itemsSummary = db.prepare('SELECT product_type, size, SUM(quantity) as total_qty FROM order_items GROUP BY product_type, size').all();
    
    res.json({
      totalRevenue: totalRevenue?.total || 0,
      itemsSummary
    });
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
