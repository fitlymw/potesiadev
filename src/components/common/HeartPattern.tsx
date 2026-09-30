export function HeartPattern() {
  return (
    <div
      className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 45 C30 45, 10 32, 10 20 C10 12, 16 8, 22 8 C26 8, 29 11, 30 14 C31 11, 34 8, 38 8 C44 8, 50 12, 50 20 C50 32, 30 45, 30 45Z' fill='%23ffffff'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px',
      }}
    />
  );
}
