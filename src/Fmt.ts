const Fmt = {
  number (number: number, decimalPlaces: number = 2) : string {
    return number.toLocaleString(undefined, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
  },
  timeSince (date: Date) : string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const s = Math.floor(diffMs / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    const y = Math.floor(d / 365);

    if (s < 60) return "Just now";
    if (m < 60) return `${m} m`;
    if (h < 24) return `${h} h`;
    if (d < 365) return `${d} ${d === 1 ? "day" : "days"}`;
    return `${y} ${y === 1 ? "year" : "years"}`;
  }
};

export default Fmt;
