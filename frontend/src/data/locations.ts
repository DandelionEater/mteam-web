export type CountryCode =
  | "LT" | "LV" | "EE"
  | "PL" | "DE" | "NL" | "BE" | "FR"
  | "ES" | "IT" | "PT"
  | "SE" | "FI" | "DK" | "NO"
  | "IE" | "GB"
  | "CZ" | "AT" | "CH";

export const COUNTRIES: { code: CountryCode; name: string }[] = [
  { code: "LT", name: "Lithuania" },
  { code: "LV", name: "Latvia" },
  { code: "EE", name: "Estonia" },

  { code: "PL", name: "Poland" },
  { code: "DE", name: "Germany" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "FR", name: "France" },

  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "PT", name: "Portugal" },

  { code: "SE", name: "Sweden" },
  { code: "FI", name: "Finland" },
  { code: "DK", name: "Denmark" },
  { code: "NO", name: "Norway" },

  { code: "IE", name: "Ireland" },
  { code: "GB", name: "United Kingdom" },

  { code: "CZ", name: "Czechia" },
  { code: "AT", name: "Austria" },
  { code: "CH", name: "Switzerland" },
];

// Miestai parinkti: sostinės + didžiausi + “žinomi” (demo atrodo solidžiai)
export const CITIES_BY_COUNTRY: Record<CountryCode, string[]> = {
  LT: ["Vilnius", "Kaunas", "Klaipėda", "Šiauliai", "Panevėžys", "Alytus", "Marijampolė", "Mažeikiai", "Jonava", "Utena"],
  LV: ["Riga", "Daugavpils", "Liepāja", "Jelgava", "Jūrmala", "Ventspils", "Rēzekne", "Valmiera"],
  EE: ["Tallinn", "Tartu", "Narva", "Pärnu", "Kohtla-Järve", "Viljandi", "Rakvere", "Sillamäe"],

  PL: ["Warsaw", "Kraków", "Wrocław", "Gdańsk", "Poznań", "Łódź", "Szczecin", "Katowice", "Lublin", "Białystok"],
  DE: ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig", "Dresden", "Hannover"],
  NL: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Tilburg", "Groningen", "Almere"],
  BE: ["Brussels", "Antwerp", "Ghent", "Charleroi", "Liège", "Bruges", "Namur", "Leuven"],
  FR: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Montpellier", "Strasbourg", "Bordeaux", "Lille"],

  ES: ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Málaga", "Bilbao", "Palma", "Murcia"],
  IT: ["Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence", "Bari", "Catania"],
  PT: ["Lisbon", "Porto", "Braga", "Coimbra", "Funchal", "Aveiro", "Setúbal", "Faro"],

  SE: ["Stockholm", "Gothenburg", "Malmö", "Uppsala", "Västerås", "Örebro", "Linköping", "Helsingborg"],
  FI: ["Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu", "Turku", "Jyväskylä", "Lahti", "Kuopio"],
  DK: ["Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg", "Randers", "Kolding", "Horsens"],
  NO: ["Oslo", "Bergen", "Trondheim", "Stavanger", "Drammen", "Fredrikstad", "Kristiansand", "Tromsø"],

  IE: ["Dublin", "Cork", "Limerick", "Galway", "Waterford", "Drogheda", "Swords", "Dundalk"],
  GB: ["London", "Birmingham", "Manchester", "Leeds", "Glasgow", "Liverpool", "Bristol", "Sheffield", "Edinburgh", "Cardiff"],

  CZ: ["Prague", "Brno", "Ostrava", "Plzeň", "Olomouc", "Liberec", "České Budějovice", "Hradec Králové"],
  AT: ["Vienna", "Graz", "Linz", "Salzburg", "Innsbruck", "Klagenfurt", "Villach", "Wels"],
  CH: ["Zürich", "Geneva", "Basel", "Lausanne", "Bern", "Winterthur", "Lucerne", "St. Gallen"],
};
