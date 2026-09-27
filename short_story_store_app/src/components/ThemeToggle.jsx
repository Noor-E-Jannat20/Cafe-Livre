export default function ThemeToggle({ theme, onToggle }) {
  const isNight = theme === 'night';
  return (
    <button
      className="theme-toggle"
      role="switch"
      aria-checked={isNight}
      aria-label={isNight ? 'Switch to day mode' : 'Switch to night mode'}
      onClick={onToggle}
      title={isNight ? 'Night mode' : 'Day mode'}
    >
      <span className="theme-toggle-knob">{isNight ? '🌙' : '☀️'}</span>
    </button>
  );
}
