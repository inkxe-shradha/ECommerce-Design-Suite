import { Link } from "wouter";
import { CheckCircle } from "lucide-react";
import { AppLayout } from "../components/AppLayout";

export default function OrderSuccessPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const orderId = searchParams.get("id");

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-emerald-500" />
        </div>
        <h1 className="text-4xl font-extrabold text-neutral-900 dark:text-neutral-100 mb-4">
          Order Successful!
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
          Thank you for your purchase. Your order #{orderId} is being processed.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-semibold rounded-xl hover:bg-neutral-300 dark:hover:bg-neutral-700 transition"
          >
            Continue Shopping
          </Link>
          <Link
            href="/orders"
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
          >
            View Order History
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
