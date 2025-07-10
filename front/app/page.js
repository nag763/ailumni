import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white p-4 px-8 shadow-sm">
        <div className="flex space-x-2">
          <Image src="/icon.png" alt="Ailumni Logo" height={12} width={34} />
          <h1 className="text-3xl font-bold text-gray-800">Ailumni</h1>
        </div>
        <Link href="/login">
          <button className="transform rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition-all hover:scale-105 hover:bg-indigo-700 active:scale-95 active:bg-indigo-800">
            Login
          </button>
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center bg-white p-8 text-center">
        <div className="max-w-3xl">
          <h2 className="mb-4 text-5xl font-bold text-gray-800">
            Unlock Your Full Learning Potential
          </h2>
          <p className="mb-8 text-xl text-gray-600">
            Ailumni is your personal AI-powered study partner. Create quizzes
            from your notes, focus on what you need to learn, and excel in your
            exams.
          </p>
          <div className="flex justify-center gap-4">
            <button className="transform rounded-lg bg-indigo-600 px-8 py-4 font-bold text-white transition-transform hover:scale-105 hover:bg-indigo-700 active:scale-95 active:bg-indigo-800">
              Get Started for Free
            </button>
            <Link href="/learn-more">
              <button className="transform rounded-lg bg-gray-200 px-8 py-4 font-bold text-gray-800 transition-all hover:scale-105 hover:bg-gray-300 active:scale-95 active:bg-gray-400">
                Learn More
              </button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t bg-gray-100 p-6 text-center">
        <p className="text-gray-600">
          &copy; 2025 Ailumni. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
