import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

function Error({ statusCode }) {
  const router = useRouter();

  const errorMessages = {
    400: 'Bad Request - The server cannot process the request',
    401: 'Unauthorized - Authentication is required',
    403: 'Forbidden - You don\'t have permission to access this resource',
    404: 'Page Not Found',
    500: 'Internal Server Error - Something went wrong on our end',
    503: 'Service Unavailable - We\'re temporarily offline for maintenance'
  };

  const title = statusCode ? `${statusCode} Error` : 'Client Error';
  const message = errorMessages[statusCode] || 'An unexpected error occurred';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 p-4">
      <Head>
        <title>{title} | Your Website</title>
        <meta name="description" content={message} />
      </Head>
      
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          {statusCode && <h1 className="text-9xl font-bold text-indigo-600">{statusCode}</h1>}
          <h2 className="text-2xl font-semibold mt-4">{title}</h2>
          <p className="mt-2 text-gray-600">{message}</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => router.back()}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
          
          <Link href="/" passHref  className="block w-full px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors">
              Return Home
           
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Need help? <a href="mailto:support@yourwebsite.com" className="text-indigo-600 hover:underline">Contact our support team</a>.</p>
        </div>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;