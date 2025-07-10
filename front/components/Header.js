import Link from 'next/link';
import Image from 'next/image';

export default function Header({ showLoginButton }) {
  return (
    <header className="flex items-center justify-between border-b bg-white p-4 px-8 shadow-sm">
      <div className="flex space-x-2">
        <Link href="/">
          <Image src="/icon.png" alt="Ailumni Logo" height={12} width={34} />
        </Link>
        <Link href="/">
          <h1 className="text-3xl font-bold text-gray-800">Ailumni</h1>
        </Link>
      </div>
      {showLoginButton && (
        <Link href="/login">
          <button className="transform rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition-all hover:scale-105 hover:bg-indigo-700 active:scale-95 active:bg-indigo-800">
            Login
          </button>
        </Link>
      )}
    </header>
  );
}