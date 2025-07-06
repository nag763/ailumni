import Link from 'next/link';

export default function LearnMore() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white p-4 px-8 shadow-sm">
        <Link href="/">
          <h1 className="text-3xl font-bold text-gray-800">Ailumni</h1>
        </Link>
        <Link href="/login">
          <button className="transform rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-all hover:scale-105 hover:bg-blue-700 active:scale-95 active:bg-blue-800">
            Login
          </button>
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center bg-white p-8 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-5xl font-bold text-gray-800">
            How Ailumni Supercharges Your Learning
          </h2>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <div className="rounded-lg bg-gray-100 p-8 shadow-sm">
              <h3 className="mb-3 text-2xl font-bold text-gray-800">
                Create Quizzes from Any Document
              </h3>
              <p className="text-gray-600">
                Upload your lecture notes, textbooks, or any other study
                material, and Ailumni will automatically generate a quiz for
                you. This allows you to test your knowledge on the specific
                content you need to learn.
              </p>
            </div>
            <div className="rounded-lg bg-gray-100 p-8 shadow-sm">
              <h3 className="mb-3 text-2xl font-bold text-gray-800">
                Learn from Existing Quizzes
              </h3>
              <p className="text-gray-600">
                Access a vast library of pre-made quizzes on various subjects.
                You can also upload quizzes you&apos;ve used before to get a
                new, randomized version that keeps you on your toes.
              </p>
            </div>
            <div className="rounded-lg bg-gray-100 p-8 shadow-sm">
              <h3 className="mb-3 text-2xl font-bold text-gray-800">
                Focus on Your Mistakes
              </h3>
              <p className="text-gray-600">
                Ailumni&apos;s intelligent algorithm identifies the questions
                you struggle with the most. It then creates personalized quizzes
                that help you focus on your weak spots, turning them into
                strengths.
              </p>
            </div>
            <div className="rounded-lg bg-gray-100 p-8 shadow-sm">
              <h3 className="mb-3 text-2xl font-bold text-gray-800">
                Track Your Progress
              </h3>
              <p className="text-gray-600">
                Visualize your learning journey with our detailed analytics. See
                how you&apos;re improving over time and identify which topics
                require more of your attention.
              </p>
            </div>
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
