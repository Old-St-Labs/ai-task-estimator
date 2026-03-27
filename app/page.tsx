import { EstimatorForm } from "./_components/EstimatorForm";

const isDemoMode = !process.env.AI_API_KEY;

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
          AI Task Estimator
        </h1>
        <p className="mt-2 text-base text-zinc-500">
          Paste your user stories, add your team, and get AI-powered task
          breakdowns with time estimates.
        </p>
        {isDemoMode && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm text-amber-700">
            <span className="h-2 w-2 rounded-full bg-amber-400 inline-block" />
            Demo mode — add <code className="font-mono font-semibold">AI_API_KEY</code> to <code className="font-mono font-semibold">.env.local</code> to enable live AI
          </div>
        )}
      </header>
      <EstimatorForm />
    </main>
  );
}
