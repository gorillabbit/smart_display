export function formatJapaneseDate(date) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  };
  return date?.toDate().toLocaleString("ja-JP", options);
}
