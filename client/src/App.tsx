import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DateRangeForm } from './components/DateRangeForm/DateRangeForm.js';
import { RecallChart } from './components/RecallChart/RecallChart.js';
import { Loader } from './components/Loader/Loader.js';
import { ErrorMessage } from './components/ErrorMessage/ErrorMessage.js';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary.js';
import { useRecallData } from './hooks/useRecallData.js';
import { useSearchParamsState } from './hooks/useSearchParamsState.js';
import './App.scss';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function RecallPage() {
  const { fromTs, toTs, setDateRange } = useSearchParamsState();
  const [validationError, setValidationError] = useState<string | null>(null);

  const { data, isLoading, isFetching, error } = useRecallData(fromTs, toTs);

  const handleSubmit = (from?: string, to?: string) => {
    setValidationError(null);
    setDateRange(from, to);
  };

  const handleValidationError = (message: string) => {
    setValidationError(message);
  };

  const displayError = validationError || (error instanceof Error ? error.message : null);
  const showLoader = isLoading || isFetching;

  return (
    <div className="recall-page">
      <header className="recall-page__header">
        <h1 className="recall-page__title">Recall Data Visualization</h1>
        <p className="recall-page__subtitle">Explore recall metrics over time with date filtering</p>
      </header>

      <main className="recall-page__content">
        <DateRangeForm
          onSubmit={handleSubmit}
          onValidationError={handleValidationError}
          isLoading={showLoader}
          initialFromDate={fromTs}
          initialToDate={toTs}
        />

        {displayError && (
          <ErrorMessage
            message={displayError}
            onDismiss={() => setValidationError(null)}
          />
        )}

        <div className="recall-page__chart-container">
          {showLoader && <Loader />}
          {!showLoader && data && (
            <ErrorBoundary>
              <RecallChart data={data} />
            </ErrorBoundary>
          )}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RecallPage />
    </QueryClientProvider>
  );
}
