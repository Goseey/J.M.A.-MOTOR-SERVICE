import { BUSINESS } from '@/lib/business';

export const metadata = {
  title: `Admin | ${BUSINESS.name}`,
  description: 'Internal admin page for J.M.A. Motor Service.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }) {
  return children;
}
