import '@/styles/globals.css';
import Layout from '@/components/Layout';
import AdminLayout from '@/components/admin/AdminLayout';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { SearchProvider } from '@/context/SearchContext';
import { SWRConfig } from 'swr';
import api from '@/lib/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function App({ Component, pageProps, router }: any) {
  const isAdminRoute = router.pathname.startsWith('/admin');
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  const pageTransition = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.4, ease: "easeOut" as any } 
    },
    exit: { 
      opacity: 0, 
      y: -15, 
      transition: { duration: 0.3, ease: "easeIn" as any } 
    }
  };

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <SWRConfig 
        value={{
          fetcher: (url: string) => api.get(url).then(res => res.data),
          revalidateOnFocus: true,
          shouldRetryOnError: true,
          errorRetryCount: 3,
          dedupingInterval: 2000
        }}
      >
        <AuthProvider>
          <CartProvider>
            <SearchProvider>
              <AnimatePresence mode="wait">
                <motion.div
                  key={router.route}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  variants={pageTransition}
                  className="flex flex-col min-h-screen"
                >
                  {isAdminRoute ? (
                    <AdminLayout title={pageProps.title || 'Administration'}>
                      <Component {...pageProps} />
                    </AdminLayout>
                  ) : (
                    <Layout>
                      <Component {...pageProps} />
                    </Layout>
                  )}
                </motion.div>
              </AnimatePresence>
            </SearchProvider>
          </CartProvider>
        </AuthProvider>
      </SWRConfig>
    </GoogleOAuthProvider>
  );
}