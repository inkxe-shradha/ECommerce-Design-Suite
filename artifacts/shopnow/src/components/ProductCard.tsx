import React from "react";
import { Link } from "wouter";
import { Star, ShoppingCart } from "lucide-react";
import { Product, useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface ProductCardProps {
  product: Product;
  reason?: string;
  className?: string;
}

export function ProductCard({ product, reason, className = "" }: ProductCardProps) {
  const queryClient = useQueryClient();
  const addToCart = useAddToCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart.mutate(
      { data: { productId: product.id, quantity: 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        }
      }
    );
  };

  const imageUrl = product.imageUrl || `${import.meta.env.BASE_URL}images/dell-xps-15.jpg`;
  const formattedPrice = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price);

  return (
    <Link href={`/product/${product.id}`} className="block">
      <div className={`min-w-[240px] h-full border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all bg-white group cursor-pointer flex flex-col ${className}`} data-testid={`card-product-${product.id}`}>
        <div className="h-40 bg-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
          <img src={imageUrl.startsWith('http') || imageUrl.startsWith('/') ? imageUrl : `${import.meta.env.BASE_URL}${imageUrl}`} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
          <button 
            onClick={handleAddToCart}
            className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-50"
            data-testid={`button-add-to-cart-${product.id}`}
          >
            <ShoppingCart size={14} className="text-gray-700" />
          </button>
          {!product.inStock && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              Out of Stock
            </div>
          )}
        </div>
        
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{product.brand}</div>
        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">{product.name}</h3>
        
        <div className="flex items-center gap-1 mb-2">
          <Star size={12} className="text-amber-400 fill-amber-400" />
          <span className="text-xs font-medium text-gray-700">{product.rating}</span>
          <span className="text-xs text-gray-400 ml-1">({product.reviewCount})</span>
        </div>
        
        <div className="mt-auto">
          <div className="font-bold text-lg mb-3">{formattedPrice}</div>
          {reason && (
            <div className="text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
              {reason}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
