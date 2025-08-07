import Link from 'next/link'
import AdminLayout from './admin/layout/AdminLayout'

export default function NotFound() {
  return (
    <AdminLayout>
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg mb-8">The page you are looking for does not exist.</p>
      <Link
        href="/admin/dashboard"
        className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
      >
        Return Home
      </Link>
    </div>
    </AdminLayout>
  )
}