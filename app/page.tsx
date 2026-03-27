import { EstimatorForm } from "./_components/EstimatorForm";

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
      </header>
      <EstimatorForm />
    </main>
  );
}
