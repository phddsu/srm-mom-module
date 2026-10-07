interface ViewButtonProps {
  onClick: () => void;
  label?: string;
}

export default function ViewButton({ onClick, label = 'View' }: ViewButtonProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-srm-blue bg-srm-blueLight border border-blue-200 hover:bg-blue-100 hover:border-srm-blue transition-all duration-150 shadow-sm hover:shadow"
      title="View full details"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {label}
    </button>
  );
}