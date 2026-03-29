import { CrossCircledIcon } from '@radix-ui/react-icons';
import './ErrorMessage.scss';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <div className="error-message" role="alert">
      <CrossCircledIcon className="error-message__icon" />
      <p className="error-message__text">{message}</p>
      {onDismiss && (
        <button className="error-message__dismiss" onClick={onDismiss} aria-label="Dismiss error">
          ×
        </button>
      )}
    </div>
  );
}
