function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-teal-500 mb-2">
        {number}
      </div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
}

export { Stat };
