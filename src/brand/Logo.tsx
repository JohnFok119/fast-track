// The Fast Track mark: a green sprout growing from a small mound of soil, for growth. Plain, with no tile.
// public/favicon.svg draws the same shapes.

export function SproutLogo({ size = 34, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="4.5 5 23 23" aria-hidden="true" focusable="false">
      <path d="M16 24.2c-.2-3.4-.1-6.8.5-10" fill="none" stroke="#6fae4c" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M16.1 18.2c-.9-3.8-3.9-6-7.8-5.8.3 3.9 3.5 6.4 7.8 5.8z" fill="#8dc265" />
      <path d="M16.5 14.6c.5-4.3 3.7-7.1 8.1-7.2.2 4.4-3.1 7.6-8.1 7.2z" fill="#5f9a3f" />
      <path d="M5.5 27.2c2.6-3.1 6.4-4.7 10.5-4.7s7.9 1.6 10.5 4.7z" fill="#9e542f" />
      <circle cx="11.6" cy="25.7" r=".85" fill="#c9773f" />
      <circle cx="19.2" cy="24.7" r=".75" fill="#c9773f" />
      <circle cx="22.4" cy="26.2" r=".7" fill="#5c3119" />
    </svg>
  );
}
