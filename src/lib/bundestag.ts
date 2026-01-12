
let cachedStatus: any = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1800 * 1000;

interface Conference {
  conferenceNumber: number;
  conferenceDate: {
    date: string;
  };
}

export async function getSessionStatus() {
  const now = Date.now();
  if (cachedStatus && (now - lastFetchTime < CACHE_DURATION)) {
    return cachedStatus;
  }

  try {
    const response = await fetch('https://www.bundestag.de/apps/plenar/plenar/conferenceWeekJSON', {
      next: { revalidate: 1800 } 
    });
    
    if (!response.ok) throw new Error("Failed to fetch Bundestag JSON");
    
    const data = await response.json();
    const conferences: Conference[] = data.conferences || [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parseGermanDate = (dateStr: string) => {
      const parts = dateStr.match(/(\d+)\.\s*(\w+)\s*(\d{4})/);
      if (!parts) return null;
      
      const day = parseInt(parts[1]);
      const monthStr = parts[2].toLowerCase();
      const year = parseInt(parts[3]);
      
      const monthMap: Record<string, number> = {
        'januar': 0, 'februar': 1, 'märz': 2, 'april': 3, 'mai': 4, 'juni': 5,
        'juli': 6, 'august': 7, 'september': 8, 'oktober': 9, 'november': 10, 'dezember': 11
      };
      
      return new Date(year, monthMap[monthStr], day);
    };

    const sortedConferences = conferences
      .map(c => ({ ...c, parsedDate: parseGermanDate(c.conferenceDate.date) }))
      .filter(c => c.parsedDate !== null)
      .sort((a, b) => a.parsedDate!.getTime() - b.parsedDate!.getTime());

    let result = {
      isSessionWeek: false,
      sitzungsnummer: '?',
      datum: today.toISOString(),
      label: 'Sitzungsfreie Zeit',
      nextDatum: null as string | null
    };

    if (sortedConferences.length === 0) {
        return result; 
    }

    const firstConf = sortedConferences[0];
    
    const liveSession = sortedConferences.find(c => c.parsedDate!.getTime() === today.getTime());

    if (liveSession) {
      result = {
        isSessionWeek: true,
        sitzungsnummer: liveSession.conferenceNumber.toString(),
        datum: liveSession.parsedDate!.toISOString(),
        label: 'Live Sitzung',
        nextDatum: null
      };
    } else {
      if (today < firstConf.parsedDate!) {
        result = {
          isSessionWeek: false,
          sitzungsnummer: (firstConf.conferenceNumber - 1).toString(),
          datum: today.toISOString(), 
          label: 'Sitzungsfreie Zeit',
          nextDatum: firstConf.parsedDate!.toISOString() 
        };
      } else {
        const pastSessions = sortedConferences.filter(c => c.parsedDate!.getTime() <= today.getTime());
        
        const futureSessions = sortedConferences.filter(c => c.parsedDate!.getTime() > today.getTime());
        const nextSession = futureSessions.length > 0 ? futureSessions[0] : null;

        if (pastSessions.length > 0) {
           const lastPast = pastSessions[pastSessions.length - 1];
           result = {
             isSessionWeek: false,
             sitzungsnummer: lastPast.conferenceNumber.toString(),
             datum: lastPast.parsedDate!.toISOString(),
             label: 'Sitzungsfreie Zeit',
             nextDatum: nextSession ? nextSession.parsedDate!.toISOString() : null
           };
        } else {
           result = {
             isSessionWeek: false,
             sitzungsnummer: '?',
             datum: today.toISOString(),
             label: 'Sitzungsfreie Zeit',
             nextDatum: nextSession ? nextSession.parsedDate!.toISOString() : null
           };
        }
      }
    }

    cachedStatus = result;
    lastFetchTime = now;
    return result;

  } catch (e) {
    console.error("Error fetching Bundestag JSON", e);
    return {
      isSessionWeek: false,
      sitzungsnummer: '?',
      datum: new Date().toISOString(),
      label: 'Fehler',
      nextDatum: null,
      error: true
    };
  }
}
