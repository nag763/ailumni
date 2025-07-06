
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import cognitoConfig from '../../cognito-config';

export default function LearnMore() {
  const router = useRouter();

  useEffect(() => {
    const userPool = new CognitoUserPool(cognitoConfig);
    const cognitoUser = userPool.getCurrentUser();

    if (cognitoUser) {
      cognitoUser.getSession((err, session) => {
        if (session) {
          router.push('/auth');
        }
      });
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="flex items-center justify-between p-4 px-8 border-b bg-white shadow-sm">
        <Link href="/">
          <h1 className="text-3xl font-bold text-gray-800">Ailumni</h1>
        </Link>
        <Link href="/login">
          <button className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all transform hover:scale-105 active:scale-95">
            Login
          </button>
        </Link>
      </header>

      <main className="flex flex-col items-center flex-1 p-8 py-12 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl font-bold text-center text-gray-800 mb-12">
            How Ailumni Supercharges Your Learning
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="p-8 bg-gray-100 rounded-lg shadow-sm">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Create Quizzes from Any Document
              </h3>
              <p className="text-gray-600">
                Upload your lecture notes, textbooks, or any other study material, and Ailumni will automatically generate a quiz for you. This allows you to test your knowledge on the specific content you need to learn.
              </p>
            </div>
            <div className="p-8 bg-gray-100 rounded-lg shadow-sm">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Learn from Existing Quizzes
              </h3>
              <p className="text-gray-600">
                Access a vast library of pre-made quizzes on various subjects. You can also upload quizzes you&apos;ve used before to get a new, randomized version that keeps you on your toes.
              </p>
            </div>
            <div className="p-8 bg-gray-100 rounded-lg shadow-sm">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Focus on Your Mistakes
              </h3>
              <p className="text-gray-600">
                Ailumni&apos;s intelligent algorithm identifies the questions you struggle with the most. It then creates personalized quizzes that help you focus on your weak spots, turning them into strengths.
              </p>
            </div>
            <div className="p-8 bg-gray-100 rounded-lg shadow-sm">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Track Your Progress
              </h3>
              <p className="text-gray-600">
                Visualize your learning journey with our detailed analytics. See how you&apos;re improving over time and identify which topics require more of your attention.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center bg-gray-100 border-t">
        <p className="text-gray-600">&copy; 2025 Ailumni. All rights reserved.</p>
      </footer>
    </div>
  );
}
