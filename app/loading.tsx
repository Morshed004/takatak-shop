export default function Loading() {
  // 3x3 grid dots er wave effect er jonno animation delays
  const delays = [0, 0.2, 0.4, 0.2, 0.4, 0.6, 0.4, 0.6, 0.8];

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="grid grid-cols-3 gap-2.5 p-4">
        {delays.map((delay, index) => (
          <span
            key={index}
            className="h-3.5 w-3.5 rounded-full bg-primary animate-pulse"
            style={{
              animationDelay: `${delay}s`,
              animationDuration: "1.2s",
            }}
          />
        ))}
      </div>
    </div>
  );
}