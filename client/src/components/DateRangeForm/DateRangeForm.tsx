import { useState } from 'react';
import DatePicker from 'react-datepicker';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import classnames from 'classnames';
import { dateRangeSchema } from '../../schemas/recall.js';
import 'react-datepicker/dist/react-datepicker.css';
import './DateRangeForm.scss';

dayjs.extend(customParseFormat);

const MIN_DATE = new Date('2000-01-01');
const MAX_DATE = new Date();

function parseInitialDate(value?: string): Date | null {
  if (!value) return null;
  const parsed = dayjs(value, 'YYYY-MM-DD');
  return parsed.isValid() ? parsed.toDate() : null;
}

interface DateRangeFormProps {
  onSubmit: (fromTs?: string, toTs?: string) => void;
  onValidationError: (message: string) => void;
  isLoading: boolean;
  initialFromDate?: string;
  initialToDate?: string;
}

export function DateRangeForm({ onSubmit, onValidationError, isLoading, initialFromDate, initialToDate }: DateRangeFormProps) {
  const [fromDate, setFromDate] = useState<Date | null>(() => parseInitialDate(initialFromDate));
  const [toDate, setToDate] = useState<Date | null>(() => parseInitialDate(initialToDate));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fromTs = fromDate ? dayjs(fromDate).format('YYYY-MM-DD') : undefined;
    const toTs = toDate ? dayjs(toDate).format('YYYY-MM-DD') : undefined;

    const validation = dateRangeSchema.safeParse({ from_ts: fromTs, to_ts: toTs });

    if (!validation.success) {
      const messages = validation.error.issues.map((i) => i.message).join('; ');
      onValidationError(messages);
      return;
    }

    onSubmit(fromTs, toTs);
  };

  const handleClear = () => {
    setFromDate(null);
    setToDate(null);
    onSubmit(undefined, undefined);
  };

  return (
    <form className="date-range-form" onSubmit={handleSubmit}>
      <div className="date-range-form__fields">
        <div className="date-range-form__field">
          <label className="date-range-form__label" htmlFor="from-date">
            From Date
          </label>
          <DatePicker
            id="from-date"
            selected={fromDate}
            onChange={(date) => setFromDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="YYYY-MM-DD"
            isClearable
            minDate={MIN_DATE}
            maxDate={toDate ?? MAX_DATE}
            className="date-range-form__input"
          />
        </div>

        <div className="date-range-form__field">
          <label className="date-range-form__label" htmlFor="to-date">
            To Date
          </label>
          <DatePicker
            id="to-date"
            selected={toDate}
            onChange={(date) => setToDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="YYYY-MM-DD"
            isClearable
            minDate={fromDate ?? MIN_DATE}
            maxDate={MAX_DATE}
            className="date-range-form__input"
          />
        </div>
      </div>

      <div className="date-range-form__actions">
        <button
          type="submit"
          className={classnames('date-range-form__button', 'date-range-form__button--primary')}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Fetch Data'}
        </button>
        <button
          type="button"
          className={classnames('date-range-form__button', 'date-range-form__button--secondary')}
          onClick={handleClear}
          disabled={isLoading}
        >
          Clear & Show All
        </button>
      </div>
    </form>
  );
}
