interface MetricCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  colorKey?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'cyan';
  subtext?: string;
}

export default function MetricCard({
  label,
  value,
  suffix = '',
  colorKey = 'primary',
  subtext = '',
}: MetricCardProps) {
  const getColorClass = () => {
    const colors: Record<string, string> = {
      primary: 'text-primary-main',
      secondary: 'text-secondary-main',
      success: 'text-success',
      error: 'text-error',
      warning: 'text-warning',
      info: 'text-info',
      cyan: 'text-secondary-main',
    };
    return colors[colorKey] || colors.primary;
  };

  return (
    <div className="rounded-lg p-2.5 border bg-bg-secondary border-border-light"
    >
      <p className="text-sm font-medium mb-2 text-text-secondary">
        {label}
      </p>
      <p className={`text-lg md:text-xl font-bold ${getColorClass()}`}>
        {value}
        {suffix && <span className="text-lg ml-1">{suffix}</span>}
      </p>
      {subtext && (
        <p className="text-xs mt-2 text-text-secondary">
          {subtext}
        </p>
      )}
    </div>
  );
}
