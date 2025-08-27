'use client'

import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 p-4">
      <Head>
        <title>Page Not Found | Your Website</title>
        <meta name="description" content="The page you're looking for doesn't exist" />
      </Head>
      
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-teal-600">404</h1>
          <h2 className="text-2xl font-semibold mt-4">Page Not Found</h2>
          <p className="mt-2 text-gray-600">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => router.back()}
            className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            Go Back
          </button>
          
          <Link href="/" passHref className="block w-full px-4 py-2 border border-teal-600 text-teal-600 rounded-md hover:bg-teal-50 transition-colors">
              Return Home
           
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>If you believe this is an error, please <a href="mailto:support@yourwebsite.com" className="text-teal-600 hover:underline">contact support</a>.</p>
        </div>
      </div>
    </div>
  );
}