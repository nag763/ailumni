import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="flex items-center justify-between p-4 px-8 border-b bg-white shadow-sm">
        <div className="flex space-x-2">
          <Image src="/icon.png" alt="Ailumni Logo" height={12} width={34} />
          <h1 className="text-3xl font-bold text-gray-800">Ailumni</h1>
        </div>
        <button className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all transform hover:scale-105 active:scale-95">
          Login with Google
        </button>
      </header>

      <main className="flex flex-col items-center justify-center flex-1 p-8 text-center bg-white">
        <div className="max-w-3xl">
          <h2 className="text-5xl font-bold text-gray-800 mb-4">
            Unlock Your Full Learning Potential
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Ailumni is your personal AI-powered study partner. Create quizzes
            from your notes, focus on what you need to learn, and excel in your
            exams.
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-8 py-4 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-transform transform hover:scale-105 active:scale-95">
              Get Started for Free
            </button>
            <Link href="/learn-more">
              <button className="px-8 py-4 font-bold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-all transform hover:scale-105 active:scale-95">
                Learn More
              </button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center bg-gray-100 border-t">
        <p className="text-gray-600">
          &copy; 2025 Ailumni. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
