interface FeatureTileProps {
  title: string;
  description: string;
  icon: string;
  onClick?: () => void;
  gradient: string;
}

export default function FeatureTile({
  title,
  description,
  icon,
  onClick,
  gradient,
}: FeatureTileProps) {
  const outerGradient = gradient;

  return (
    <button
      onClick={onClick}
      className={`w-full h-full text-left bg-linear-to-br ${outerGradient} p-0.5 rounded-lg hover:shadow-lg transition transform hover:scale-105 group`}
    >
      <div
        className="rounded-lg p-8 h-full flex flex-col justify-between transition bg-bg-primary hover:bg-bg-secondary"
      >
        <div>
          <div className="text-5xl mb-4">{icon}</div>
          <h3 className="text-2xl font-bold mb-3 text-text-primary">
            {title}
          </h3>
          <p className="leading-relaxed text-text-secondary">
            {description}
          </p>
        </div>
        <div className="inline-flex items-center group-hover:translate-x-2 transition text-primary-main">
          <span className="pr-2">Explore</span>
          <svg
            className="w-5 h-5 transform transition"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </button>
  );
}
