import './Loader.scss';

export function Loader() {
  return (
    <div className="loader" role="status" aria-label="Loading data">
      <div className="loader__spinner" />
      <p className="loader__text">Loading recall data...</p>
    </div>
  );
}
