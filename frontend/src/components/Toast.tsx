interface Props {
  message: string;
  type?: 'success' | 'error';
}

export default function Toast({ message, type = 'success' }: Props) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div
        className={`rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg ${
          type === 'error'
            ? 'bg-red-600 text-white'
            : 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-950'
        }`}
      >
        {message}
      </div>
    </div>
  );
}
