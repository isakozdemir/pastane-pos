import React, { useState, useMemo, useEffect } from 'react';
import { 
  Cake, Coffee, Utensils, Receipt, LayoutDashboard, Clock, CheckCircle2, 
  AlertCircle, Printer, Plus, Minus, Trash2, Search, Filter, TrendingUp, 
  CreditCard, Banknote, ShoppingBag, Sparkles, User, Tag, ChevronRight, X
} from 'lucide-react';

// Varsayılan Pastane Ürün Kataloğu
const INITIAL_PRODUCTS = [
  { id: 'p1', name: 'Çilekli & Çikolatalı Pasta (4-6 Kişilik)', category: 'Butik Pastalar', price: 580, icon: '🎂', badge: 'Popüler' },
  { id: 'p2', name: 'Karaorman Meyveli Pasta', category: 'Butik Pastalar', price: 640, icon: '🍰' },
  { id: 'p3', name: 'San Sebastian Cheesecake', category: 'Butik Pastalar', price: 195, icon: '🧀', badge: 'Şefin Seçimi' },
  { id: 'p4', name: 'Tiramisu (Klasik İtalyan)', category: 'Sütlü/Şerbetli', price: 175, icon: '🍮' },
  { id: 'p5', name: 'Fırın Sütlaç', category: 'Sütlü/Şerbetli', price: 120, icon: '🥣' },
  { id: 'p6', name: 'Havuç Dilim Baklava (Porsiyon)', category: 'Sütlü/Şerbetli', price: 210, icon: '🍯' },
  { id: 'p7', name: 'Kaşarlı & Zeytinli Açma', category: 'Börek & Poğaça', price: 45, icon: '🥯' },
  { id: 'p8', name: 'Kıymalı Kol Böreği (Porsiyon)', category: 'Börek & Poğaça', price: 135, icon: '🥟', badge: 'Taze Çıktı' },
  { id: 'p9', name: 'Dereotlu Peynirli Poğaça', category: 'Börek & Poğaça', price: 40, icon: '🥐' },
  { id: 'p10', name: 'Özel Tasarım Resimli Butik Pasta', category: 'Özel Tasarım', price: 1150, icon: '✨', badge: 'Sipariş Üzerine' },
  { id: 'p11', name: 'Macaron Kutusu (6\'lı Renkli)', category: 'Özel Tasarım', price: 280, icon: '🧁' },
  { id: 'p12', name: 'Filtre Kahve', category: 'İçecekler', price: 75, icon: '☕' },
  { id: 'p13', name: 'Karamel Latte', category: 'İçecekler', price: 95, icon: '🧋' },
  { id: 'p14', name: 'Taze Demleme Çay', category: 'İçecekler', price: 25, icon: '🍵' },
  { id: 'p15', name: 'Ev Yapımı Taze Limonata', category: 'İçecekler', price: 85, icon: '🍋' },
];

const CATEGORIES = ['Tümü', 'Butik Pastalar', 'Sütlü/Şerbetli', 'Börek & Poğaça', 'İçecekler', 'Özel Tasarım'];

export default function PatisseriePOS() {
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'kitchen' | 'reports'
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');

  // Aktif Sipariş Durumu
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState('Masa'); // 'Masa', 'Paket', 'Özel Teslimat'
  const [tableNumber, setTableNumber] = useState('Masa 3');
  const [paymentMethod, setPaymentMethod] = useState('Kredi Kartı');
  const [kitchenNote, setKitchenNote] = useState('');

  // Tüm Siparişler (Veritabanı Simülasyonu)
  const [orders, setOrders] = useState([
    {
      id: 'PST-101',
      date: new Date(Date.now() - 45 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customerName: 'Selin Yılmaz',
      orderType: 'Masa',
      tableNumber: 'Masa 4',
      status: 'Hazırlanıyor', // 'Bekliyor', 'Hazırlanıyor', 'Hazır', 'Tamamlandı'
      paymentMethod: 'Kredi Kartı',
      totalAmount: 465,
      kitchenNote: 'Cheesecake sosu bol çikolatalı olsun lütfen.',
      items: [
        { id: 'p3', name: 'San Sebastian Cheesecake', price: 195, quantity: 2 },
        { id: 'p12', name: 'Filtre Kahve', price: 75, quantity: 1 }
      ]
    },
    {
      id: 'PST-100',
      date: new Date(Date.now() - 110 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customerName: 'Ahmet Demir',
      orderType: 'Paket',
      tableNumber: '-',
      status: 'Hazır',
      paymentMethod: 'Nakit',
      totalAmount: 860,
      kitchenNote: 'Pastanın üzerine "İyi ki Doğdun Ece" yazılacak, altın mum eklensin.',
      items: [
        { id: 'p1', name: 'Çilekli & Çikolatalı Pasta (4-6 Kişilik)', price: 580, quantity: 1 },
        { id: 'p11', name: 'Macaron Kutusu (6\'lı Renkli)', price: 280, quantity: 1 }
      ]
    }
  ]);

  // Fiş Önizleme / Yazdırma Modali
  const [printModalOrder, setPrintModalOrder] = useState(null);

  // Filtrelenmiş Ürünler
  const filteredProducts = useMemo(() => {
    return INITIAL_PRODUCTS.filter(p => {
      const matchesCat = selectedCategory === 'Tümü' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Sepet İşlemleri
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1, itemNote: '' }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const updateItemNote = (id, note) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, itemNote: note } : item));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setKitchenNote('');
  };

  // Sepet Toplamı
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Siparişi Onayla & Mutfağa İlet
  const handlePlaceOrder = (shouldPrintImmediately = false) => {
    if (cart.length === 0) return;

    const newOrderNumber = `PST-${101 + orders.length}`;
    const newOrder = {
      id: newOrderNumber,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customerName: customerName.trim() || 'Misafir',
      orderType,
      tableNumber: orderType === 'Masa' ? tableNumber : '-',
      status: 'Bekliyor',
      paymentMethod,
      totalAmount: cartSubtotal,
      kitchenNote: kitchenNote.trim(),
      items: [...cart]
    };

    setOrders([newOrder, ...orders]);
    clearCart();

    if (shouldPrintImmediately) {
      setPrintModalOrder(newOrder);
    }
  };

  // Mutfak Durumunu Güncelle
  const updateOrderStatus = (orderId, nextStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: nextStatus } : order
    ));
  };

  // Termal Fiş Yazdırma Tetikleyicisi
  const triggerBrowserPrint = () => {
    window.print();
  };

  // Rapor İstatistikleri
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const cardPayments = orders.filter(o => o.paymentMethod === 'Kredi Kartı').reduce((sum, o) => sum + o.totalAmount, 0);
  const cashPayments = orders.filter(o => o.paymentMethod === 'Nakit').reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingKitchenOrders = orders.filter(o => o.status === 'Bekliyor' || o.status === 'Hazırlanıyor').length;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#4A3E3D] font-sans flex flex-col">
      {/* 1. ÜST GEZİNME VE BAŞLIK BAR (Print esnasında gizlenir) */}
      <header className="bg-white border-b border-[#EADBC8] shadow-sm sticky top-0 z-30 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E0A96D] to-[#C38D9E] flex items-center justify-center text-white shadow-md">
              <Cake className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#3A2E2B]">Pâtisserie & Fırın Sistemi</h1>
              <p className="text-xs text-[#8C7A78] flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Kasa & Mutfak Entegrasyonu Aktif
              </p>
            </div>
          </div>

          {/* Sekme Butonları */}
          <nav className="flex items-center bg-[#F4EDE4] p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('pos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'pos' 
                  ? 'bg-white text-[#9B5134] shadow-sm' 
                  : 'text-[#7D6B68] hover:text-[#3A2E2B]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Sipariş & Kasa
            </button>
            <button
              onClick={() => setActiveTab('kitchen')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all relative ${
                activeTab === 'kitchen' 
                  ? 'bg-white text-[#9B5134] shadow-sm' 
                  : 'text-[#7D6B68] hover:text-[#3A2E2B]'
              }`}
            >
              <Utensils className="w-4 h-4" />
              Mutfak Ekranı (KDS)
              {pendingKitchenOrders > 0 && (
                <span className="bg-[#D9534F] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                  {pendingKitchenOrders}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'reports' 
                  ? 'bg-white text-[#9B5134] shadow-sm' 
                  : 'text-[#7D6B68] hover:text-[#3A2E2B]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Ciro & Özet
            </button>
          </nav>
        </div>
      </header>

      {/* 2. ANA İÇERİK ALANI */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 print:hidden">
        {/* --- TAB 1: KASA & SİPARİŞ GİRİŞİ (POS) --- */}
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sol Bölüm: Ürün Listesi ve Filtreleme (8 Kolon) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              {/* Filtre ve Arama Çubuğu */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#EFE3D5] flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A89895]" />
                  <input
                    type="text"
                    placeholder="Ürün veya lezzet ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#E8DACB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C38D9E]"
                  />
                </div>

                {/* Kategori Hapları */}
                <div className="flex gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-none">
                  {CATEGORIES.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-[#A66C52] text-white shadow-sm'
                          : 'bg-[#F2E8DC] text-[#695450] hover:bg-[#EBDDCF]'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ürün Kartları Izgarası */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {filteredProducts.map(product => {
                  const inCartCount = cart.find(c => c.id === product.id)?.quantity || 0;
                  return (
                    <div
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="bg-white rounded-2xl p-3.5 border border-[#EFE5D9] hover:border-[#D6A284] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                    >
                      {product.badge && (
                        <span className="absolute top-2 right-2 text-[10px] bg-[#F7E6DC] text-[#A66C52] font-semibold px-2 py-0.5 rounded-full">
                          {product.badge}
                        </span>
                      )}
                      <div>
                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{product.icon}</div>
                        <h3 className="font-semibold text-xs sm:text-sm text-[#3E302E] leading-tight line-clamp-2">
                          {product.name}
                        </h3>
                        <span className="text-[11px] text-[#9A8785] block mt-0.5">{product.category}</span>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#F5EDE3] flex items-center justify-between">
                        <span className="font-bold text-sm text-[#94523B]">₺{product.price}</span>
                        <div className="w-7 h-7 rounded-lg bg-[#FAF4ED] group-hover:bg-[#A66C52] group-hover:text-white text-[#94523B] flex items-center justify-center transition-colors">
                          {inCartCount > 0 ? (
                            <span className="text-xs font-bold">{inCartCount}</span>
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sağ Bölüm: Aktif Sipariş ve Kasa Özeti (4 Kolon) */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="bg-white rounded-2xl shadow-sm border border-[#EAE0D3] p-5 sticky top-24 flex flex-col max-h-[calc(100vh-7rem)]">
                {/* Başlık ve Masa/Paket Seçimi */}
                <div className="pb-3 border-b border-[#F0E6DA]">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-[#3B2D2B] flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-[#A66C52]" />
                      Cari Sipariş Fişi
                    </h2>
                    {cart.length > 0 && (
                      <button 
                        onClick={clearCart} 
                        className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Temizle
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#FAF6F0] rounded-xl text-xs font-semibold">
                    {['Masa', 'Paket', 'Özel Teslimat'].map(type => (
                      <button
                        key={type}
                        onClick={() => setOrderType(type)}
                        className={`py-1.5 rounded-lg transition-all ${
                          orderType === type 
                            ? 'bg-[#A66C52] text-white shadow-xs' 
                            : 'text-[#7D6A67] hover:text-[#3B2D2B]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {/* İsim ve Masa Bilgisi */}
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div>
                      <label className="text-[11px] text-[#8C7A77] font-medium block mb-1">Müşteri Adı</label>
                      <input
                        type="text"
                        placeholder="Örn: Ayşe H."
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-[#E5D7C7] rounded-lg text-xs focus:ring-1 focus:ring-[#A66C52] focus:outline-none"
                      />
                    </div>
                    {orderType === 'Masa' ? (
                      <div>
                        <label className="text-[11px] text-[#8C7A77] font-medium block mb-1">Masa No</label>
                        <select
                          value={tableNumber}
                          onChange={(e) => setTableNumber(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-[#E5D7C7] rounded-lg text-xs focus:ring-1 focus:ring-[#A66C52] focus:outline-none"
                        >
                          <option>Masa 1</option>
                          <option>Masa 2</option>
                          <option>Masa 3</option>
                          <option>Masa 4</option>
                          <option>Bahçe 1</option>
                          <option>Bahçe 2</option>
                          <option>Teras</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="text-[11px] text-[#8C7A77] font-medium block mb-1">Teslimat Notu</label>
                        <input
                          type="text"
                          placeholder="Paket hazırla"
                          className="w-full px-2.5 py-1.5 bg-[#FAF7F2] border border-[#E5D7C7] rounded-lg text-xs"
                          readOnly
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Sepet Ürün Listesi */}
                <div className="flex-1 overflow-y-auto py-3 space-y-3 min-h-[140px] pr-1">
                  {cart.length === 0 ? (
                    <div className="text-center py-10 text-[#9E8D8A]">
                      <Cake className="w-10 h-10 mx-auto text-[#DBCBC6] mb-2 stroke-[1.5]" />
                      <p className="text-xs">Henüz ürün seçilmedi</p>
                      <p className="text-[11px] text-[#B8A7A4]">Sol taraftan lezzetleri tıklayarak ekleyebilirsiniz.</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.id} className="p-2.5 bg-[#FCFAF7] rounded-xl border border-[#EFE5DB] text-xs space-y-1.5">
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-[#3C2E2C] flex-1 pr-2">{item.name}</span>
                          <span className="font-bold text-[#94523B]">₺{item.price * item.quantity}</span>
                        </div>

                        {/* Mutfak Kalem Notu */}
                        <input
                          type="text"
                          placeholder="Ürün notu (Örn: Isıtılsın, az şekerli)..."
                          value={item.itemNote || ''}
                          onChange={(e) => updateItemNote(item.id, e.target.value)}
                          className="w-full px-2 py-1 text-[11px] bg-white border border-[#E5D8CC] rounded placeholder:text-[#B5A5A2] focus:outline-none focus:ring-1 focus:ring-[#A66C52]"
                        />

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-[#8A7977]">₺{item.price} x {item.quantity}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-6 h-6 rounded-md bg-[#EFE4D6] hover:bg-[#E3D3C2] flex items-center justify-center font-bold text-[#574442]"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-bold w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-6 h-6 rounded-md bg-[#EFE4D6] hover:bg-[#E3D3C2] flex items-center justify-center font-bold text-[#574442]"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-6 h-6 rounded-md text-rose-400 hover:text-rose-600 flex items-center justify-center ml-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Alt Kısım: Genel Mutfak Notu, Ödeme ve Butonlar */}
                <div className="border-t border-[#F0E6DA] pt-3 space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-[#7D6A67] flex items-center gap-1 mb-1">
                      <Sparkles className="w-3 h-3 text-[#A66C52]" />
                      Mutfak / Pasta Yazı Notu (Fişe Basılır):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Örn: Pasta üstüne 'İyi ki doğdun' yazılsın, 10 adet mum eklensin..."
                      value={kitchenNote}
                      onChange={(e) => setKitchenNote(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-[#FAF7F2] border border-[#E5D7C7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A66C52]"
                    />
                  </div>

                  {/* Ödeme Yöntemi */}
                  <div className="flex items-center justify-between bg-[#F8F3ED] p-1.5 rounded-xl">
                    <span className="text-xs font-semibold pl-2 text-[#63514E]">Ödeme Türü:</span>
                    <div className="flex gap-1 text-xs">
                      <button
                        onClick={() => setPaymentMethod('Kredi Kartı')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium ${
                          paymentMethod === 'Kredi Kartı' ? 'bg-white shadow text-[#A66C52]' : 'text-[#877573]'
                        }`}
                      >
                        <CreditCard className="w-3 h-3" /> Kart
                      </button>
                      <button
                        onClick={() => setPaymentMethod('Nakit')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium ${
                          paymentMethod === 'Nakit' ? 'bg-white shadow text-[#A66C52]' : 'text-[#877573]'
                        }`}
                      >
                        <Banknote className="w-3 h-3" /> Nakit
                      </button>
                    </div>
                  </div>

                  {/* Fiyat Toplamı */}
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-sm font-medium text-[#756260]">Genel Tutar</span>
                    <span className="text-2xl font-black text-[#8E442B]">₺{cartSubtotal}</span>
                  </div>

                  {/* Butonlar */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      disabled={cart.length === 0}
                      onClick={() => handlePlaceOrder(false)}
                      className="py-2.5 px-3 bg-[#D4A373] hover:bg-[#C28E5B] disabled:opacity-50 text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Utensils className="w-4 h-4" />
                      Mutfağa Gönder
                    </button>
                    <button
                      disabled={cart.length === 0}
                      onClick={() => handlePlaceOrder(true)}
                      className="py-2.5 px-3 bg-[#94523B] hover:bg-[#7D422E] disabled:opacity-50 text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Printer className="w-4 h-4" />
                      Fiş Çıkar & İlet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: MUTFAK EKRANI (KDS - Canlı Sipariş Hazırlık Paneli) --- */}
        {activeTab === 'kitchen' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#EAE0D3]">
              <div>
                <h2 className="text-lg font-bold text-[#3B2D2B] flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-[#A66C52]" />
                  Canlı Mutfak Hazırlık & Sipariş Paneli
                </h2>
                <p className="text-xs text-[#8C7A77]">Gelen siparişleri anlık takip edin, termal fiş yazdırın ve durumu güncelleyin.</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg">
                  Bekleyen: {orders.filter(o => o.status === 'Bekliyor').length}
                </span>
                <span className="px-3 py-1 bg-sky-100 text-sky-800 rounded-lg">
                  Hazırlanıyor: {orders.filter(o => o.status === 'Hazırlanıyor').length}
                </span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg">
                  Hazır: {orders.filter(o => o.status === 'Hazır').length}
                </span>
              </div>
            </div>

            {/* Mutfak Sipariş Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map(order => (
                <div 
                  key={order.id} 
                  className={`bg-white rounded-2xl border shadow-sm transition-all overflow-hidden flex flex-col justify-between ${
                    order.status === 'Bekliyor' ? 'border-amber-300 ring-2 ring-amber-100' :
                    order.status === 'Hazırlanıyor' ? 'border-sky-300 ring-2 ring-sky-100' :
                    order.status === 'Hazır' ? 'border-emerald-300' : 'border-gray-200 opacity-60'
                  }`}
                >
                  {/* Kart Başlığı */}
                  <div className="p-3.5 bg-[#FAF7F2] border-b border-[#EFE4D6] flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#3B2D2B] text-base">{order.id}</span>
                        <span className="text-xs px-2 py-0.5 rounded font-medium bg-[#EFE4D6] text-[#695552]">
                          {order.orderType}: {order.tableNumber}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#8C7A77] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {order.date} • {order.customerName}
                      </span>
                    </div>

                    <button
                      onClick={() => setPrintModalOrder(order)}
                      className="p-1.5 rounded-lg bg-white border border-[#E5DACD] text-[#6B5754] hover:bg-[#F2E7DC] hover:text-[#94523B] transition-colors"
                      title="Mutfak Fişi Görüntüle & Yazdır"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Kalemler */}
                  <div className="p-4 flex-1 space-y-2.5">
                    <div className="space-y-1.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="border-b border-[#F5ECE1] pb-1.5 last:border-none">
                          <div className="flex justify-between items-start text-xs font-semibold text-[#3C2E2C]">
                            <span>{item.quantity}x {item.name}</span>
                          </div>
                          {item.itemNote && (
                            <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-1 font-medium">
                              ⚠️ Not: {item.itemNote}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Mutfak Genel Notu */}
                    {order.kitchenNote && (
                      <div className="mt-3 p-2 bg-[#FBF0E4] border border-[#F0DCB8] rounded-xl text-xs text-[#8A5123]">
                        <span className="font-bold flex items-center gap-1 mb-0.5">
                          <Sparkles className="w-3.5 h-3.5" /> Pasta/Sipariş Notu:
                        </span>
                        {order.kitchenNote}
                      </div>
                    )}
                  </div>

                  {/* Durum Değiştirme Butonları */}
                  <div className="p-3 bg-[#FAF8F5] border-t border-[#EFE5D9] flex items-center justify-between gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      order.status === 'Bekliyor' ? 'bg-amber-100 text-amber-800' :
                      order.status === 'Hazırlanıyor' ? 'bg-sky-100 text-sky-800' :
                      order.status === 'Hazır' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {order.status === 'Bekliyor' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Hazırlanıyor')}
                          className="text-xs px-3 py-1.5 bg-[#4A7C59] hover:bg-[#3D664A] text-white font-medium rounded-lg shadow-sm"
                        >
                          Hazırlanıyor Yap
                        </button>
                      )}
                      {order.status === 'Hazırlanıyor' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Hazır')}
                          className="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm"
                        >
                          Hazır İşaretle
                        </button>
                      )}
                      {order.status === 'Hazır' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Tamamlandı')}
                          className="text-xs px-3 py-1.5 bg-[#8C7A77] hover:bg-[#6D5D5B] text-white font-medium rounded-lg"
                        >
                          Teslim Edildi
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 3: SATIŞ RAPORU VE CİRO ÖZETİ --- */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* KPI Metrik Kartları */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-[#EAE0D3] shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#8C7A77]">Günlük Toplam Ciro</span>
                  <h3 className="text-2xl font-black text-[#94523B] mt-1">₺{totalRevenue.toLocaleString()}</h3>
                  <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> Günlük hedef tutturuldu
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#F7EBE1] flex items-center justify-center text-[#94523B]">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#EAE0D3] shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#8C7A77]">Toplam Sipariş</span>
                  <h3 className="text-2xl font-black text-[#3B2D2B] mt-1">{orders.length} Adet</h3>
                  <span className="text-[11px] text-[#8C7A77] mt-1 block">Aktif Masa: {orders.filter(o => o.status !== 'Tamamlandı').length}</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#EAF2ED] flex items-center justify-center text-[#4A7C59]">
                  <Receipt className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#EAE0D3] shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#8C7A77]">Kredi Kartı Satışları</span>
                  <h3 className="text-2xl font-black text-[#2B4C7E] mt-1">₺{cardPayments.toLocaleString()}</h3>
                  <span className="text-[11px] text-[#8C7A77] mt-1 block">POS Cihazı Toplamı</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-[#2B4C7E]">
                  <CreditCard className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#EAE0D3] shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#8C7A77]">Nakit Kasa</span>
                  <h3 className="text-2xl font-black text-amber-700 mt-1">₺{cashPayments.toLocaleString()}</h3>
                  <span className="text-[11px] text-[#8C7A77] mt-1 block">Fiziki Çekmece</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700">
                  <Banknote className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Geçmiş Sipariş Tablosu */}
            <div className="bg-white rounded-2xl border border-[#EAE0D3] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#F0E6DA] flex justify-between items-center">
                <h3 className="font-bold text-[#3B2D2B] text-sm">Bugünün Sipariş Dökümü</h3>
                <span className="text-xs text-[#8C7A77]">Tüm kayıtlar</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] text-[#705C59] border-b border-[#EFE4D6]">
                    <tr>
                      <th className="p-3 font-semibold">Sipariş No</th>
                      <th className="p-3 font-semibold">Saat</th>
                      <th className="p-3 font-semibold">Müşteri</th>
                      <th className="p-3 font-semibold">Tür</th>
                      <th className="p-3 font-semibold">İçerik</th>
                      <th className="p-3 font-semibold">Ödeme</th>
                      <th className="p-3 font-semibold">Durum</th>
                      <th className="p-3 font-semibold text-right">Tutar</th>
                      <th className="p-3 font-semibold text-center">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5ECE1]">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-[#FCFAF7] transition-colors">
                        <td className="p-3 font-bold text-[#94523B]">{order.id}</td>
                        <td className="p-3 text-[#7D6B68]">{order.date}</td>
                        <td className="p-3 font-medium text-[#3A2E2B]">{order.customerName}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-[#F4EDE4] text-[#695552] text-[11px] font-medium">
                            {order.orderType} ({order.tableNumber})
                          </span>
                        </td>
                        <td className="p-3 text-[#5A4744] max-w-[200px] truncate">
                          {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </td>
                        <td className="p-3">
                          <span className="flex items-center gap-1 text-[#695552]">
                            {order.paymentMethod === 'Kredi Kartı' ? <CreditCard className="w-3.5 h-3.5" /> : <Banknote className="w-3.5 h-3.5" />}
                            {order.paymentMethod}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            order.status === 'Hazır' ? 'bg-emerald-100 text-emerald-800' :
                            order.status === 'Hazırlanıyor' ? 'bg-sky-100 text-sky-800' :
                            order.status === 'Tamamlandı' ? 'bg-gray-100 text-gray-700' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-[#8E442B]">₺{order.totalAmount}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setPrintModalOrder(order)}
                            className="p-1 hover:bg-[#F2E7DC] rounded text-[#8C7A77] hover:text-[#94523B]"
                            title="Fiş Önizle"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. TERMAL FİŞ ÖNİZLEME MODALI */}
      {printModalOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 print:p-0 print:static print:bg-transparent">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E0D0C0] relative print:shadow-none print:border-none print:w-full print:max-w-none print:p-0">
            {/* Modal Kapat Butonu (Print esnasında gizli) */}
            <button
              onClick={() => setPrintModalOrder(null)}
              className="absolute top-4 right-4 text-[#A89895] hover:text-[#3B2D2B] p-1 rounded-full print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* FİŞ GÖVDESİ (Termal Kağıt Görünümü - 80mm Uyumlu) */}
            <div id="receipt-area" className="font-mono text-xs text-black border-dashed border border-gray-300 p-4 bg-[#FFFDF9] rounded-xl shadow-inner print:shadow-none print:border-none print:p-2">
              <div className="text-center pb-3 border-b border-black">
                <h2 className="text-base font-extrabold tracking-wider uppercase">LEZZET PÂTISSERIE</h2>
                <p className="text-[10px]">Butik Pasta & Fırın Mutfak Fişi</p>
                <p className="text-[10px] mt-1">Tel: (0212) 555 0192 • İstanbul</p>
              </div>

              <div className="py-2 border-b border-black space-y-0.5 text-[11px]">
                <div className="flex justify-between">
                  <span>Fiş No: <strong>{printModalOrder.id}</strong></span>
                  <span>Saat: {printModalOrder.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Müşteri: <strong>{printModalOrder.customerName}</strong></span>
                  <span>{printModalOrder.orderType}: <strong>{printModalOrder.tableNumber}</strong></span>
                </div>
                <div>
                  <span>Ödeme: {printModalOrder.paymentMethod}</span>
                </div>
              </div>

              {/* Sipariş Edilen Ürünler */}
              <div className="py-3 border-b border-black space-y-2">
                <div className="flex justify-between font-bold border-b border-dotted border-gray-400 pb-1 text-[11px]">
                  <span>Ürün</span>
                  <span>Ad. x Fiyat</span>
                  <span>Tutar</span>
                </div>
                {printModalOrder.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between">
                      <span className="font-semibold">{item.name}</span>
                      <span>{item.quantity} x ₺{item.price}</span>
                      <span className="font-bold">₺{item.quantity * item.price}</span>
                    </div>
                    {item.itemNote && (
                      <div className="text-[10px] italic pl-2 text-gray-800">
                        * {item.itemNote}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Toplam */}
              <div className="py-2 border-b border-black text-right space-y-1">
                <div className="text-sm font-black flex justify-between">
                  <span>TOPLAM TUTAR:</span>
                  <span>₺{printModalOrder.totalAmount}</span>
                </div>
              </div>

              {/* Mutfak / Pasta Yazı Notu */}
              {printModalOrder.kitchenNote && (
                <div className="py-2.5 my-2 bg-yellow-50 border border-yellow-200 p-2 rounded text-[11px] leading-tight">
                  <strong className="block text-black font-extrabold uppercase mb-0.5">⚠️ MUTFAK NOTU / YAZI:</strong>
                  {printModalOrder.kitchenNote}
                </div>
              )}

              <div className="text-center pt-3 text-[10px] text-gray-600">
                <p>*** MUTFAK SİPARİŞ KOPYASI ***</p>
                <p>Afiyet olsun dileriz!</p>
              </div>
            </div>

            {/* Modal Butonları (Yazdır & Kapat) */}
            <div className="mt-5 flex gap-2 print:hidden">
              <button
                onClick={() => setPrintModalOrder(null)}
                className="w-1/2 py-2 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Kapat
              </button>
              <button
                onClick={triggerBrowserPrint}
                className="w-1/2 py-2 text-xs font-bold rounded-xl bg-[#94523B] hover:bg-[#7D422E] text-white flex items-center justify-center gap-1.5 shadow-md"
              >
                <Printer className="w-4 h-4" /> Yazdır
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. YALNIZCA YAZICI (PRINTER) İÇİN GÖRÜNÜR ALAN */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-area, #receipt-area * {
            visibility: visible;
          }
          #receipt-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 78mm;
            margin: 0;
            padding: 8px;
            font-size: 11px;
            border: none !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
