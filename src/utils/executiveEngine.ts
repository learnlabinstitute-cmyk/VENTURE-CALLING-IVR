/**
 * Executive SOP Response Matcher and Natural Neural Speech Generation
 * For Venture Infotech Support 24 Calling IVR
 */

/**
 * Intelligent Executive SOP Response Matcher.
 * Matches caller statements, legal threats, complaints, and queries to official scripts.
 */
export function matchExecutiveResponse(
  userInput: string,
  callerName: string = "Sir/Ma'am",
  plan?: string
): string {
  const query = (userInput || "").toLowerCase().trim();

  // 1. Police / Cyber / Legal Threat & Official Escalation Protocol
  if (
    /(police|cyber|legal|court|case|fir|thaan[ae]|420|fraud|jail|vakil|advocate|lawyer|threat|dhamki|action lung|notice)/i.test(
      query
    )
  ) {
    return "Kisi bhi complaint ya issue ke liye aapko official escalation procedure follow karna hoga. Direct threats ya arbitrary steps legal & system policy ka breach hain. Agar policy breach hota hai, toh saari call recordings aur activity history relevant authorities ko legal proof ke roop mein submit kar di jayegi.";
  }

  // 2. Anti-Harassment, Abusive Language & Call Recording
  if (
    /(gaali|badtameez|bakwas|stupid|idiot|harass|abuse|shutup|chup|pagal|kutta|harami|madarchod|bhenchod|bhosd|bullshit|kamine)/i.test(
      query
    )
  ) {
    return "Yeh call quality aur training purposes ke liye record ki ja rahi hai. Kisi bhi tarah ki gaali-galoch, abusive words, ya misbehavior ki recording system dwara save hoti hai. Abuse repeat hone par ye recording breach evidence ke taur par submit kar di jayegi aur account suspend hoga.";
  }

  // 3. UltraViewer & Personal Ad Account Setup vs Agency Account
  if (
    /(ultraviewer|personal account|apne account|khud k[ae] account|remote|access|slot|screen share|teamviewer|anydesk)/i.test(
      query
    )
  ) {
    return "Bilkul Sir/Ma'am! AAP apne personal Facebook/Google Ad Account mein bhi ads run karwa sakte hain. Iska process bohot simple aur secure hai:\n1. Dedicated Technical Slot Booking: Sabse pehle main aapki request par hamaari Technical Setup Team ke saath aapka Dedicated Slot Book kar deti hoon. Slot timing fixed hoti hai taaki hamaara senior ad expert sirf aapke setup par hi focus kare.\n2. UltraViewer Access & Setup: Haan ji Sir/Ma'am, slot time par hamaare ad executive UltraViewer ke zariye aapke system ka remote access lenge. Sab kuch aapke laptop/computer screen ke saamne live hoga. Hamaara executive aapke samne aapke personal account mein ad manager, pixel, aur campaigns set up karega. Aap poori process live dekh sakte hain, isse aapki privacy aur account security 100% maintain rehti hai.";
  }

  // 4. Payment / Service Dispute Resolution (Email Routing)
  if (
    /(paisa|rupaye|payment|refund|wapas|money|transaction|service nahi|cheating|loot|dispute|scam|dhokha)/i.test(
      query
    )
  ) {
    return "Agar aapko service me koi pareshani aayi hai, toh pehle aap support executive se baat karke apna Backup Execution Plan activate karwa lijiye. Agar aap phir bhi payment refund ya dispute chahte hain, toh apna Payment Screenshot aur Query official email ID venture.infotech.digital@gmail.com par bhej dijiye. Hamaari finance team iska formal review karegi.";
  }

  // 5. Ad Account Suspension / Facebook Ban / Review
  if (
    /(suspend|ban|disable|policy|restricted|meta hold|review|bm disable|rejected)/i.test(
      query
    )
  ) {
    return "Don't worry Sir/Ma'am, Meta policies ke chalte initial review ya temporary hold lagna normal hai. Hamaari technical compliance team turant appeal file karegi aur backup agency ad account ya BM switch karegi taaki aapke campaigns bina interruption chalte rahein.";
  }

  // 6. Zero Sales / Low ROI / Algorithm Learning
  if (
    /(sale|order|conversion|result|roas|roi|kharab|loss|nuksan|budget|ad chal|customer nahi)/i.test(
      query
    )
  ) {
    return "Main samajh sakti hoon aapki concern. Initial 48 hours Meta algorithm ka testing aur learning phase hota hai. Agar creatives optimize nahi ho rahe, toh hum immediately Backup Execution Plan implement karte hain jisme winning tested creatives aur high-converting target audience switch ki jaati hai.";
  }

  // 7. Plan Inquiry or Verification
  if (
    /(plan|package|silver|gold|platinum|starter|growth|scale|upgrade|verify)/i.test(
      query
    )
  ) {
    const active = plan ? `Aapka current ${plan} active hai.` : "";
    return `Venture Infotech me Starter, Growth aur Scale plans provide kiye jaate hain. ${active} Har plan ke sath dedicated campaign manager, creative testing aur continuous support included rehta hai.`;
  }

  // 8. Greetings & General Inquiries
  if (
    /(hello|hi|namaste|hey|kaise ho|who are you|kon ho|kaun ho|sun rahe ho)/i.test(
      query
    )
  ) {
    return `Namaste ${callerName}! Main Senior Customer Care Executive Isha baat kar rahi hoon Venture Infotech Solution Support 24 se. Main aapke store aur advertising campaign performance ko assist kar rahi hoon. Kripya apna issue batayein, main turant help karungi.`;
  }

  // 9. Conversational Default
  return `Ji bilkul ${callerName}, maine aapka point note kar liya hai. Venture Infotech me hum har issue ko priority par resolve karte hain. Aap befikr rahiye, hamaari technical support team ispar active solution provide karegi.`;
}

/**
 * Robust Neural TTS Audio Generator (No robotic synthesizer voice).
 * Uses Google's natural neural audio service with sentence-level chunking.
 * Returns Base64-encoded natural MP3 audio data.
 */
export async function fetchNeuralTTSAudio(
  text: string,
  lang: string = "hi"
): Promise<string> {
  const clean = text
    .replace(/[*_#`[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) {
    throw new Error("Empty text for TTS generation");
  }

  // Break text into natural spoken chunks under 180 chars
  const chunks: string[] = [];
  if (clean.length <= 180) {
    chunks.push(clean);
  } else {
    const sentences = clean.split(/(?<=[.!?।,\n])/);
    let cur = "";
    for (const s of sentences) {
      if ((cur + s).length > 180) {
        if (cur.trim()) chunks.push(cur.trim());
        cur = s;
      } else {
        cur += s;
      }
    }
    if (cur.trim()) chunks.push(cur.trim());
  }

  const buffers: Buffer[] = [];
  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      trimmed
    )}&tl=${lang}&client=tw-ob`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      throw new Error(`Neural TTS fetch failed with HTTP ${res.status}`);
    }

    const arrayBuf = await res.arrayBuffer();
    buffers.push(Buffer.from(arrayBuf));
  }

  const combined = Buffer.concat(buffers);
  return combined.toString("base64");
}
