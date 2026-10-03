/**
 * সংখ্যা ও টাকার ফরম্যাট এক জায়গায়।
 * "bn" = ১,২৩৪   |   "en" = 1,234
 */
export const NUMERALS: "bn" | "en" = "bn";

const locale = NUMERALS === "bn" ? "bn-BD" : "en-BD";

export const bn = (n: number) => n.toLocaleString(locale);
export const taka = (n: number) => `৳${bn(n)}`;