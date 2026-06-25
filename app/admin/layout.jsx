import { BUSINESS } from '@/lib/business';

export const metadata = {
  title: `Admin Preview | ${BUSINESS.name}`,
  description: 'Internal admin preview page for J.M.A. Motor Service.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }) {
  return children;
}
