export interface EssayMetadata {
  title: string;
  subtitle: string;
  featured: boolean;
  publishedAt: string;
  publishedAtFormatted: string;
  audio?: string;
  image?: string;
  category: string;
}

export interface EssayReadingTime {
  text: string;
  minutes: number;
  time: number;
  words: number;
}

export interface EssayListItem {
  slug: string;
  metadata: EssayMetadata;
  readingTime: EssayReadingTime;
}
