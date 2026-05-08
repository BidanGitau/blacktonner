export const BRAND = {
  name: "Blacktoner Technologies",
  domain: "blacktonertechnologies.co.ke",
  email: "sales@blacktonertechnologies.co.ke",
  phone: "+254 111 040 400",
  whatsappNumber: "254792792750",
  address: "Nairobi, Kenya",
} as const;

/** Normalise a Kenyan phone number to international format (e.g. 254712345678). */
export function normaliseKePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("254") && (digits.length === 12)) return digits;
  if (digits.startsWith("0") && digits.length === 10) return "254" + digits.slice(1);
  if (digits.length === 9 && (digits.startsWith("7") || digits.startsWith("1"))) return "254" + digits;
  if (digits.startsWith("+254")) return digits.slice(1);
  return null;
}

export function formatKePhoneDisplay(input: string): string {
  const normalised = normaliseKePhone(input);
  if (!normalised) return input;
  return `+${normalised.slice(0, 3)} ${normalised.slice(3, 6)} ${normalised.slice(6, 9)} ${normalised.slice(9)}`;
}
