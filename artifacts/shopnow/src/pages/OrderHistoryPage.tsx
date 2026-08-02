import React, { useState, useMemo } from 'react';
import { Link } from 'wouter';
import {
  Package,
  Calendar,
  CreditCard,
  MapPin,
  Truck,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Download,
  RotateCcw,
  MessageSquare,
  Copy,
  Check,
  Search,
  Tag,
  ShoppingBag,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetOrders,
  getGetOrdersQueryKey,
  useAddToCart,
  getGetCartQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useUser } from '../context/UserContext';
import { AppLayout } from '../components/AppLayout';
import {
  resolveProductImageSrc,
  onProductImageError,
} from '../lib/product-image';

interface OrderItemProduct {
  id: number;
  name: string;
  brand?: string;
  category?: string;
  componentType?: string;
  imageUrl?: string;
  price: number;
}

interface OrderLineItem {
  id: number;
  productId: number;
  quantity: number;
  priceAtPurchase: number;
  product?: OrderItemProduct | null;
}

interface OrderData {
  id: number;
  subtotalAmount?: number;
  productDiscountAmount?: number;
  couponDiscountAmount?: number;
  shippingAmount?: number;
  totalAmount: number;
  appliedCouponCode?: string | null;
  couponSnapshot?: any;
  status: string;
  shippingAddress: any;
  paymentDetails: any;
  createdAt: string;
  items?: OrderLineItem[];
}

export default function OrderHistoryPage() {
  const { user, isLoggedIn } = useUser();
  const queryClient = useQueryClient();
  const addToCart = useAddToCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedOrders, setExpandedOrders] = useState<Record<number, boolean>>({});
  const [copiedOrderId, setCopiedOrderId] = useState<number | null>(null);
  const [reorderedItemId, setReorderedItemId] = useState<number | null>(null);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<OrderData | null>(null);

  const { data: orders, isLoading, error } = useGetOrders({
    query: {
      enabled: isLoggedIn,
      queryKey: getGetOrdersQueryKey(),
    },
  });

  const toggleExpand = (orderId: number) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const copyOrderId = (orderId: number) => {
    navigator.clipboard.writeText(`ORD-${orderId}`);
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const handleReorder = (productId: number) => {
    setReorderedItemId(productId);
    addToCart.mutate(
      { data: { productId, quantity: 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          setTimeout(() => setReorderedItemId(null), 2000);
        },
        onError: () => setReorderedItemId(null),
      },
    );
  };

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return (orders as unknown as OrderData[]).filter((order) => {
      // Status filter
      if (selectedStatus !== 'all') {
        const s = (order.status || '').toLowerCase();
        if (selectedStatus === 'processing' && !s.includes('process')) return false;
        if (selectedStatus === 'shipped' && !s.includes('ship')) return false;
        if (selectedStatus === 'delivered' && !s.includes('deliver')) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = `ord-${order.id}`.includes(q) || String(order.id).includes(q);
        const matchesItem = (order.items || []).some(
          (it) => it.product?.name?.toLowerCase().includes(q) || it.product?.brand?.toLowerCase().includes(q),
        );
        return matchesId || matchesItem;
      }

      return true;
    });
  }, [orders, selectedStatus, searchQuery]);

  const formatCurrency = (val?: number | null) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val ?? 0);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('deliver')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 size={13} className="text-emerald-500" />
          Delivered
        </span>
      );
    }
    if (s.includes('ship')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-800">
          <Truck size={13} className="text-blue-500 animate-pulse" />
          Shipped
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full border border-amber-200 dark:border-amber-800">
        <Clock size={13} className="text-amber-500 animate-spin" />
        Processing
      </span>
    );
  };

  const getStepperStage = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('deliver')) return 4;
    if (s.includes('out')) return 3;
    if (s.includes('ship')) return 2;
    return 1;
  };

  const printInvoice = (order: OrderData) => {
    setInvoiceModalOrder(order);
  };

  const content = () => {
    if (!isLoggedIn) {
      return (
        <div className="max-w-4xl mx-auto py-24 px-4 text-center">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-100 dark:border-indigo-900">
            <Package size={36} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-3 text-neutral-900 dark:text-neutral-100">
            Track Your Orders
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-8">
            Please log in to view your order history, track live shipments, download invoices, and manage reorders.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
          >
            Log In to View Orders <ArrowRight size={18} />
          </Link>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="max-w-5xl mx-auto py-16 px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
            <div className="h-12 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
            <div className="h-64 w-full bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
            <div className="h-64 w-full bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="max-w-3xl mx-auto py-20 px-4 text-center">
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-8 rounded-2xl">
            <p className="text-red-600 dark:text-red-400 font-semibold mb-4">
              Unable to load your order history.
            </p>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: getGetOrdersQueryKey() })}
              aria-label="Try loading orders again"
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 text-neutral-900 dark:text-neutral-100">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-900">
                <Package size={26} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Order History</h1>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Manage orders, track live deliveries, and download receipts
                </p>
              </div>
            </div>
          </div>

          {/* Quick stats pill */}
          {orders && orders.length > 0 && (
            <div className="flex items-center gap-4 bg-white dark:bg-neutral-900 p-3 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm shrink-0">
              <div className="text-center px-2">
                <div className="text-xs text-neutral-500 dark:text-neutral-400">Total Orders</div>
                <div className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{orders.length}</div>
              </div>
              <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-800" />
              <div className="text-center px-2">
                <div className="text-xs text-neutral-500 dark:text-neutral-400">Account</div>
                <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{user?.name}</div>
              </div>
            </div>
          )}
        </div>

        {/* Filter & Search Bar */}
        {orders && orders.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm mb-8 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input
                type="text"
                placeholder="Search by Order # or product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All Orders' },
                { id: 'processing', label: 'Processing' },
                { id: 'shipped', label: 'Shipped' },
                { id: 'delivered', label: 'Delivered' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id)}
                  aria-label={`Filter orders by ${tab.label}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedStatus === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!orders || orders.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 p-12 rounded-3xl text-center border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
              <ShoppingBag size={32} />
            </div>
            <h2 className="text-xl font-bold mb-2">No orders placed yet</h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-sm mx-auto mb-6">
              When you purchase products or custom PC builds, your complete order history and live tracking will appear here.
            </p>
            <Link
              href="/category/Gaming"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20"
            >
              Start Shopping <ArrowRight size={16} />
            </Link>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 p-8 rounded-2xl text-center border border-neutral-200 dark:border-neutral-800">
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              No orders matched your search or status filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('all');
              }}
              aria-label="Reset order filters"
              className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrders[order.id] ?? true;
              const currentStage = getStepperStage(order.status);

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden transition-all hover:border-neutral-300 dark:hover:border-neutral-700"
                >
                  {/* Order Top Bar */}
                  <div className="p-5 sm:p-6 bg-neutral-50/70 dark:bg-neutral-800/40 border-b border-neutral-100 dark:border-neutral-800 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="font-extrabold text-lg text-neutral-900 dark:text-neutral-100">
                        #ORD-{order.id}
                      </div>
                      <button
                        onClick={() => copyOrderId(order.id)}
                        aria-label={`Copy order number ORD-${order.id}`}
                        className="p-1 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        title="Copy Order ID"
                      >
                        {copiedOrderId === order.id ? (
                          <Check size={15} className="text-emerald-500" />
                        ) : (
                          <Copy size={15} />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={15} className="text-neutral-400" />
                        <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <span>•</span>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  {/* Delivery Stepper Bar */}
                  <div className="p-5 sm:p-6 border-b border-neutral-100 dark:border-neutral-800/80 bg-white dark:bg-neutral-900">
                    <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Truck size={14} className="text-indigo-600 dark:text-indigo-400" />
                      Live Delivery Tracker
                    </div>

                    <div className="relative flex items-center justify-between max-w-2xl mx-auto px-4">
                      {/* Connecting Line */}
                      <div className="absolute left-6 right-6 top-4 h-1 bg-neutral-200 dark:bg-neutral-800 -z-0">
                        <div
                          className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
                          style={{
                            width:
                              currentStage === 1
                                ? '0%'
                                : currentStage === 2
                                ? '33%'
                                : currentStage === 3
                                ? '66%'
                                : '100%',
                          }}
                        />
                      </div>

                      {[
                        { step: 1, label: 'Order Placed', icon: Clock },
                        { step: 2, label: 'Confirmed', icon: ShieldCheck },
                        { step: 3, label: 'Shipped', icon: Truck },
                        { step: 4, label: 'Delivered', icon: CheckCircle2 },
                      ].map((s) => {
                        const isDone = currentStage >= s.step;
                        const Icon = s.icon;
                        return (
                          <div key={s.step} className="flex flex-col items-center z-10">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                isDone
                                  ? 'bg-indigo-600 text-white border-indigo-600 dark:border-indigo-500 shadow-md'
                                  : 'bg-white dark:bg-neutral-900 text-neutral-400 border-neutral-300 dark:border-neutral-700'
                              }`}
                            >
                              <Icon size={14} />
                            </div>
                            <span
                              className={`text-[11px] font-semibold mt-2 text-center ${
                                isDone
                                  ? 'text-neutral-900 dark:text-neutral-100 font-bold'
                                  : 'text-neutral-400 dark:text-neutral-500'
                              }`}
                            >
                              {s.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Toggle Content Button */}
                  <button
                    onClick={() => toggleExpand(order.id)}
                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} details for order #${order.id}`}
                    className="w-full px-6 py-2.5 bg-neutral-50/50 dark:bg-neutral-800/30 flex items-center justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border-b border-neutral-100 dark:border-neutral-800"
                  >
                    <span>{isExpanded ? 'Hide Items & Breakdown' : 'Show Line Items & Breakdown'}</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {/* Expandable Order Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-5 sm:p-6 space-y-6"
                      >
                        {/* Line Items List */}
                        {order.items && order.items.length > 0 && (
                          <div className="space-y-4">
                            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                              Order Items ({order.items.length})
                            </div>

                            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                              {order.items.map((item) => {
                                const prod = item.product;
                                const isReordering = reorderedItemId === item.productId;

                                return (
                                  <div
                                    key={item.id}
                                    className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-4"
                                  >
                                    {/* Thumbnail */}
                                    <div className="w-16 h-16 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                                      <img
                                        src={resolveProductImageSrc(prod?.imageUrl, prod?.name)}
                                        alt={prod?.name || 'Product'}
                                        className="w-full h-full object-contain"
                                        onError={(e) => onProductImageError(e, prod?.name)}
                                      />
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0">
                                      {prod ? (
                                        <Link
                                          href={`/product/${prod.id}`}
                                          className="font-semibold text-sm hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-1 transition-colors"
                                        >
                                          {prod.name}
                                        </Link>
                                      ) : (
                                        <div className="font-semibold text-sm">Product Item #{item.productId}</div>
                                      )}

                                      <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                        {prod?.brand && (
                                          <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                            {prod.brand}
                                          </span>
                                        )}
                                        {prod?.componentType && (
                                          <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px] font-medium">
                                            {prod.componentType}
                                          </span>
                                        )}
                                        <span>Qty: {item.quantity}</span>
                                      </div>
                                    </div>

                                    {/* Price & Reorder Action */}
                                    <div className="text-right shrink-0">
                                      <div className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                                        {formatCurrency(item.priceAtPurchase * item.quantity)}
                                      </div>

                                      <button
                                        onClick={() => handleReorder(item.productId)}
                                        disabled={isReordering}
                                        aria-label={`Buy again ${prod?.name || 'Product'}`}
                                        className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
                                      >
                                        <RotateCcw size={12} className={isReordering ? 'animate-spin' : ''} />
                                        {isReordering ? 'Added!' : 'Buy Again'}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Financial Summary & Delivery Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-sm">
                          {/* Shipping Address */}
                          <div className="bg-neutral-50 dark:bg-neutral-800/60 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800">
                            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                              <MapPin size={14} className="text-indigo-600 dark:text-indigo-400" /> Shipping Address
                            </div>
                            <div className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
                              <p className="font-bold text-neutral-900 dark:text-neutral-100">
                                {(order.shippingAddress as any)?.name || user?.name}
                              </p>
                              <p>{(order.shippingAddress as any)?.street}</p>
                              <p>
                                {(order.shippingAddress as any)?.city},{' '}
                                {(order.shippingAddress as any)?.zip}
                              </p>
                            </div>
                          </div>

                          {/* Payment Method */}
                          <div className="bg-neutral-50 dark:bg-neutral-800/60 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800">
                            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                              <CreditCard size={14} className="text-indigo-600 dark:text-indigo-400" /> Payment Details
                            </div>
                            <div className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-300 space-y-1">
                              <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                                {(order.paymentDetails as any)?.cardNumber || 'Credit / Debit Card'}
                              </p>
                              <p className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                <CheckCircle2 size={12} /> Payment Verified
                              </p>
                            </div>
                          </div>

                          {/* Order Price Breakdown */}
                          <div className="bg-neutral-50 dark:bg-neutral-800/60 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 space-y-2">
                            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                              <span>Subtotal</span>
                              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                {formatCurrency(order.subtotalAmount)}
                              </span>
                            </div>

                            {Number(order.productDiscountAmount) > 0 && (
                              <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400">
                                <span>Product Discounts</span>
                                <span className="font-semibold">-{formatCurrency(order.productDiscountAmount)}</span>
                              </div>
                            )}

                            {order.appliedCouponCode && (
                              <div className="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 p-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900">
                                <span className="flex items-center gap-1 font-bold">
                                  <Tag size={12} /> Coupon ({order.appliedCouponCode})
                                </span>
                                <span className="font-bold">-{formatCurrency(order.couponDiscountAmount)}</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                              <span>Shipping</span>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">FREE</span>
                            </div>

                            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between font-extrabold text-sm">
                              <span>Total Paid</span>
                              <span className="text-indigo-600 dark:text-indigo-400 text-base">
                                {formatCurrency(order.totalAmount)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                          <button
                            onClick={() => printInvoice(order)}
                            aria-label={`Download invoice for order #${order.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold rounded-xl transition-colors border border-neutral-200 dark:border-neutral-700"
                          >
                            <Download size={14} /> Download Tax Invoice
                          </button>

                          <div className="flex items-center gap-3">
                            <Link
                              href={`/order/${order.id}`}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                            >
                              View Full Invoice Page <ExternalLink size={13} />
                            </Link>
                            <Link
                              href="/ai-chat"
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-xl transition-colors border border-indigo-100 dark:border-indigo-900"
                            >
                              <MessageSquare size={14} /> Need Help?
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Printable Tax Invoice Modal */}
        <AnimatePresence>
          {invoiceModalOrder && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-neutral-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 space-y-6"
              >
                {/* Invoice Header */}
                <div className="flex justify-between items-start border-b border-neutral-200 dark:border-neutral-800 pb-6">
                  <div>
                    <div className="flex items-center gap-2 font-black text-xl text-indigo-600 dark:text-indigo-400">
                      <Sparkles size={24} /> ShopNow Electronics
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Official Tax Invoice & Payment Receipt
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">INVOICE #INV-{invoiceModalOrder.id}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      Date: {new Date(invoiceModalOrder.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Billed To */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="font-bold text-neutral-400 uppercase tracking-wider mb-1">Billed To</div>
                    <div className="font-bold text-sm">{user?.name}</div>
                    <p>{(invoiceModalOrder.shippingAddress as any)?.street}</p>
                    <p>
                      {(invoiceModalOrder.shippingAddress as any)?.city},{' '}
                      {(invoiceModalOrder.shippingAddress as any)?.zip}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-neutral-400 uppercase tracking-wider mb-1">Payment Details</div>
                    <p className="font-semibold">{(invoiceModalOrder.paymentDetails as any)?.cardNumber || 'Credit Card'}</p>
                    <p className="text-emerald-600 dark:text-emerald-400 font-bold">PAID IN FULL</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-neutral-100 dark:bg-neutral-800 font-bold text-neutral-600 dark:text-neutral-300">
                      <tr>
                        <th className="p-3">Item Description</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Price</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                      {(invoiceModalOrder.items || []).map((it) => (
                        <tr key={it.id}>
                          <td className="p-3 font-semibold">{it.product?.name || `Item #${it.productId}`}</td>
                          <td className="p-3 text-center">{it.quantity}</td>
                          <td className="p-3 text-right">{formatCurrency(it.priceAtPurchase)}</td>
                          <td className="p-3 text-right font-bold">
                            {formatCurrency(it.priceAtPurchase * it.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Invoice Total */}
                <div className="flex justify-end text-xs">
                  <div className="w-64 space-y-1.5 text-right">
                    <div className="flex justify-between text-neutral-500">
                      <span>Subtotal:</span>
                      <span className="font-bold">{formatCurrency(invoiceModalOrder.subtotalAmount)}</span>
                    </div>
                    {invoiceModalOrder.appliedCouponCode && (
                      <div className="flex justify-between text-indigo-600 dark:text-indigo-400">
                        <span>Coupon ({invoiceModalOrder.appliedCouponCode}):</span>
                        <span className="font-bold">-{formatCurrency(invoiceModalOrder.couponDiscountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-neutral-500">
                      <span>Shipping:</span>
                      <span className="font-bold text-emerald-600">FREE</span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold pt-2 border-t border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100">
                      <span>Total Amount:</span>
                      <span className="text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(invoiceModalOrder.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Modal Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    onClick={() => window.print()}
                    aria-label="Print invoice document"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
                  >
                    <Download size={14} /> Print / Save PDF
                  </button>
                  <button
                    onClick={() => setInvoiceModalOrder(null)}
                    aria-label="Close invoice modal"
                    className="px-5 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return <AppLayout activePage="orders">{content()}</AppLayout>;
}
