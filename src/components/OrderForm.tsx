import React, { useState } from 'react';
import { CATALOG, OrderItem, ProductCatalogItem, ProductSize } from '../types';
import { Plus, Trash2, ShoppingCart, Save, ChevronDown, Check } from 'lucide-react';

interface OrderFormProps {
  onSave: (customerName: string, church: string, items: OrderItem[], totalAmount: number) => Promise<void>;
}

export default function OrderForm({ onSave }: OrderFormProps) {
  const [customerName, setCustomerName] = useState('');
  const [church, setChurch] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  
  // Current item being added
  const [selectedProductId, setSelectedProductId] = useState<string>('camisas');
  const [selectedDesign, setSelectedDesign] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);

  const selectedProduct = CATALOG[selectedProductId];

  const handleAddItem = () => {
    if (!selectedDesign) {
      alert('Por favor selecciona un diseño.');
      return;
    }
    if (selectedProduct.sizes && !selectedSize) {
      alert('Por favor selecciona una talla.');
      return;
    }
    if (quantity < 1) {
      alert('La cantidad debe ser al menos 1.');
      return;
    }

    let unitPrice = selectedProduct.price || 0;
    if (selectedProduct.sizes && selectedSize) {
      const sizeObj = selectedProduct.sizes.find(s => s.label === selectedSize);
      if (sizeObj) unitPrice = sizeObj.price;
    }

    const newItem: OrderItem = {
      product_type: selectedProduct.name,
      design: selectedDesign,
      size: selectedSize || undefined,
      quantity,
      unit_price: unitPrice,
      subtotal: unitPrice * quantity
    };

    setItems([...items, newItem]);
    
    // Reset form but keep product type
    setSelectedDesign('');
    setSelectedSize('');
    setQuantity(1);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSave = async () => {
    if (!customerName.trim() || !church.trim()) {
      alert('Por favor ingresa el nombre y la iglesia.');
      return;
    }
    if (items.length === 0) {
      alert('El pedido debe tener al menos un artículo.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(customerName, church, items, totalAmount);
      // Clear form on success
      setCustomerName('');
      setChurch('');
      setItems([]);
      alert('Pedido guardado exitosamente.');
    } catch (error) {
      alert('Error al guardar el pedido.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Datos del Cliente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="Ej. Juan Pérez"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Iglesia</label>
            <input
              type="text"
              value={church}
              onChange={(e) => setChurch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="Ej. Central"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Agregar Productos</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
            <div className="relative">
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setSelectedDesign('');
                  setSelectedSize('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              >
                {Object.values(CATALOG).map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Diseño</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {selectedProduct.designs.map(design => (
                <button
                  key={design}
                  onClick={() => setSelectedDesign(design)}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    selectedDesign === design 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                      : 'border-gray-200 hover:border-indigo-300 text-gray-700'
                  }`}
                >
                  {selectedDesign === design && <Check className="w-4 h-4" />}
                  {design}
                </button>
              ))}
            </div>
          </div>

          {selectedProduct.sizes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Talla</label>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.sizes.map(size => (
                  <button
                    key={size.label}
                    onClick={() => setSelectedSize(size.label)}
                    className={`w-12 h-12 rounded-xl border text-sm font-medium transition-all flex flex-col items-center justify-center ${
                      selectedSize === size.label 
                        ? 'border-indigo-600 bg-indigo-600 text-white' 
                        : 'border-gray-200 hover:border-indigo-300 text-gray-700'
                    }`}
                  >
                    <span>{size.label}</span>
                  </button>
                ))}
              </div>
              {selectedSize && (
                <p className="text-sm text-gray-500 mt-2">
                  Precio unitario: C$ {selectedProduct.sizes.find(s => s.label === selectedSize)?.price}
                </p>
              )}
            </div>
          )}

          <div className="flex items-end gap-4">
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <button
              onClick={handleAddItem}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Agregar al Pedido
            </button>
          </div>
        </div>
      </div>

      {items.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingCart className="w-6 h-6 text-gray-900" />
            <h2 className="text-xl font-semibold text-gray-900">Resumen del Pedido</h2>
          </div>
          
          <div className="space-y-4 mb-6">
            {items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">
                    {item.quantity}x {item.product_type}
                  </p>
                  <p className="text-sm text-gray-500">
                    Diseño: {item.design} {item.size && `| Talla: ${item.size}`}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold text-gray-900">C$ {item.subtotal}</p>
                  <button
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between py-4 border-t border-gray-100 mb-6">
            <span className="text-lg font-medium text-gray-700">Total a Pagar</span>
            <span className="text-2xl font-bold text-gray-900">C$ {totalAmount}</span>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-3.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-lg"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Guardando...' : 'Guardar Pedido'}
          </button>
        </div>
      )}
    </div>
  );
}
