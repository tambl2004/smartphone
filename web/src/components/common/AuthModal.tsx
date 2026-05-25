import { useState } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { motion, AnimatePresence } from 'motion/react';

export const AuthModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Welcome to NEXPHONE</h2>
        <p className="text-sm text-neutral-500">Sign in to unlock the flagship experience</p>
      </div>

      <div className="flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-md mb-6">
        <button
          onClick={() => setTab('login')}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${tab === 'login' ? 'bg-white dark:bg-neutral-900 shadow-sm text-black dark:text-white' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
        >
          Login
        </button>
        <button
          onClick={() => setTab('register')}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${tab === 'register' ? 'bg-white dark:bg-neutral-900 shadow-sm text-black dark:text-white' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
        >
          Register
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'login' ? (
            <div className="space-y-4">
              <Input label="Email" type="email" placeholder="hello@nexphone.com" />
              <Input label="Password" type="password" placeholder="••••••••" />
              <div className="flex justify-end">
                <a href="#" className="text-xs font-medium text-neutral-500 hover:text-black dark:hover:text-white transition-colors">Forgot password?</a>
              </div>
              <Button fullWidth>Sign In</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Input label="Full Name" placeholder="Elon Musk" />
              <Input label="Email" type="email" placeholder="hello@nexphone.com" />
              <Input label="Password" type="password" placeholder="••••••••" />
              <Button fullWidth>Create Account</Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </Modal>
  );
};
