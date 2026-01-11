interface ThemedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const ThemedInput = ({
  label,
  error,
  className = '',
  ...props
}: ThemedInputProps) => {

  return (
    <div className="w-full">
      {label && (
        <label
          className="block font-medium mb-2 text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {label}
        </label>
      )}
      <input
        {...props}
        className={`w-full rounded-lg px-4 py-2 transition border ${className}`}
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderColor: 'var(--color-border-main)',
          color: 'var(--color-text-primary)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-primary-main)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border-main)';
        }}
      />
      {error && (
        <p className="text-sm mt-1" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default ThemedInput;
