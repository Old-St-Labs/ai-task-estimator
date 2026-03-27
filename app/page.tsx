import { EstimatorForm } from "./_components/EstimatorForm";

const isDemoMode = !process.env.AI_API_KEY;

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8 sm:py-14">
      {/* Hero header */}
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          AI Task Estimator
        </h1>
        <p className="mt-2 text-xl font-semibold text-teal-500 sm:text-2xl">
          How can I help you today?
        </p>

        {/* Action pills */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74z" />
            </svg>
            Ask AI
          </span>

          {isDemoMode ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-600">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Demo mode
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-white px-4 py-2 text-sm font-medium text-teal-600">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
              Live AI
            </span>
          )}

          <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-500">
            Estimate tasks
          </span>
        </div>
      </header>

      <EstimatorForm />
    </div>
  );
}
