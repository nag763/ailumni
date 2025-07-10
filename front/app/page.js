import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header showLoginButton={true} />

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

      <Footer />
    </div>
  );
}
