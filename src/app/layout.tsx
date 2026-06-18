import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/contexts/StoreContext';
import ClientLayout from './ClientLayout';

export const metadata: Metadata = {
  title: {
    default: 'femfashion — Moda Feminina angolana',
    template: '%s | femfashion Luanda',
  },
  description: 'Perucas front lace HD, vestidos de luxo, sapatos premium e acessórios exclusivos para a mulher angolana moderna. Entrega em Luanda e províncias.',
  keywords: ['moda feminina angola', 'perucas luanda', 'vestidos festa angola', 'femfashion'],
  openGraph: {
    siteName: 'femfashion',
    locale: 'pt_AO',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <StoreProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </StoreProvider>
      </body>
    </html>
  );
}
