import { ShoppingBag } from 'lucide-react';
import { useCart } from '@hooks/useCart';
import { useRouter } from '@routes/router';
import { motion, AnimatePresence } from 'motion/react';
import { formatPrice } from '@utils/format';

export const FloatingCart = () => {
  const { cartCount, cartTotal } = useCart();
  const { navigate } = useRouter();

  return (
    <AnimatePresence>
      {cartCount > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          onClick={() => navigate('/cart')}
          className="fixed bottom-6 left-6 z-50 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-floating flex items-center gap-3 px-4 py-3 hover:scale-105 transition-transform"
        >
          <div className="relative">
            <ShoppingBag size={20} />
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          </div>
          <div className="flex flex-col items-start pr-2">
            <span className="text-[10px] font-bold tracking-wider uppercase opacity-70">Checkout</span>
            <span className="text-sm font-bold leading-none">{formatPrice(cartTotal)}</span>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
