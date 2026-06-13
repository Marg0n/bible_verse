export interface Verse {
  Verseid: string;
  Verse: string;
}

export interface Chapter {
  Verse: Verse[];
}

export interface Book {
  Chapter: Chapter[];
}

export interface Bible {
  Book: Book[];
}

export type VerseData = {
  book_bn: string;
  book_en: string;
  text_bn: string;
  text_en: string;
  chapter: number;
  verse: number;
  date?: string;
};
