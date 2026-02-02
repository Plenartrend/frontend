import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPublisher(publisher?: string): string {
  if (!publisher) return "";
  if (publisher === "BT") return "Bundestag";
  if (publisher === "BR") return "Bundesrat";
  return publisher;
}

export function formatSession(session?: string): string {
  if (!session) return "";
  
  // Try to match "<number1>/<number2>" pattern
  const dualNumberMatch = session.match(/^(\d+)\/(\d+)$/);
  if (dualNumberMatch) {
    return `${dualNumberMatch[1]}. Wahlperiode, ${dualNumberMatch[2]}. Sitzung`;
  }

  // Try to match "<number>" pattern
  const singleNumberMatch = session.match(/^(\d+)$/);
  if (singleNumberMatch) {
    return `${singleNumberMatch[1]}. Sitzung`;
  }

  return session;
}

export function formatSpeechTitle(
  publisher: string | undefined,
  title: string,
  firstName: string,
  lastName: string,
  date: string,
  topicId?: string,
  topicCategory?: string
): string {
  if (publisher === "BT" || publisher === "BR") {
    const dateStr = new Date(date).toLocaleDateString('de-DE');
    let generatedTitle = `Rede von ${firstName} ${lastName} am ${dateStr}`;
   /* if (topicId && topicId !== '-1' && topicCategory && topicCategory !== '') {
      generatedTitle += ` zum Thema: ${topicCategory}`;
    }*/
    return generatedTitle;
  }
  return title;
}
