import { useGetOrders, getGetOrdersQueryKey } from "@workspace/api-client-react";
import { Package, Calendar, CreditCard, MapPin } from "lucide-react";
import { useUser } from "../context/UserContext";
import { AppLayout } from "../components/AppLayout";

export default function OrderHistoryPage() {
  const { user } = useUser();
  const { data: orders, isLoading, error } = useGetOrders({
    query: {
      enabled: !!user,
      queryKey: getGetOrdersQueryKey(),
    }
  });

  const content = () => {
    if (!user) {
      return (
        <div className="max-w-4xl mx-auto py-24 px-4 text-center">
          <Package className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-3 text-neutral-900 dark:text-neutral-100">Order History</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Please log in to view your orders.</p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="text-center py-24 text-neutral-500 dark:text-neutral-400">
          <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
          Loading your orders…
        </div>
      );
    }

    if (error) {
      return <div className="text-center py-20 text-red-500 dark:text-red-400">Failed to load orders.</div>;
    }

    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-neutral-900 dark:text-neutral-100">
        <div className="flex items-center gap-3 mb-8">
          <Package className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="bg-white dark:bg-neutral-800 p-8 rounded-2xl text-center border border-neutral-200 dark:border-neutral-700">
            <Package className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-neutral-500 dark:text-neutral-400">When you place orders, they will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700">
                <div className="flex flex-wrap justify-between items-start mb-4 pb-4 border-b border-neutral-100 dark:border-neutral-700">
                  <div>
                    <h3 className="font-bold text-lg">Order #{order.id}</h3>
                    <div className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      ₹{order.totalAmount}
                    </div>
                    <span className="inline-block mt-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-2 font-semibold mb-1">
                      <MapPin className="w-4 h-4" /> Shipping Address
                    </div>
                    <div className="text-neutral-600 dark:text-neutral-400">
                      <p>{(order.shippingAddress as any)?.name}</p>
                      <p>{(order.shippingAddress as any)?.street}</p>
                      <p>{(order.shippingAddress as any)?.city}, {(order.shippingAddress as any)?.zip}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-semibold mb-1">
                      <CreditCard className="w-4 h-4" /> Payment Details
                    </div>
                    <div className="text-neutral-600 dark:text-neutral-400">
                      <p>{(order.paymentDetails as any)?.cardNumber}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <AppLayout>
      {content()}
    </AppLayout>
  );
}
