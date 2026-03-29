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
