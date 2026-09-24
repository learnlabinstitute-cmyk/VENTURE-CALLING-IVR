function isValidGeminiApiKey(key: string | undefined): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  return (
    trimmed !== "" &&
    trimmed !== "MY_GEMINI_API_KEY" &&
    !trimmed.startsWith("AQ.") &&
    trimmed.startsWith("AIza")
  );
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  res.status(200).json({
    status: "ok",
    hasApiKey: isValidGeminiApiKey(process.env.GEMINI_API_KEY),
    model: "gemini-3.8-flash",
    platform: "vercel",
  });
}
