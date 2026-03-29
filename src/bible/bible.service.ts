import { Injectable } from '@nestjs/common';
import bnBible from '../assets/bible-bn.json';
import enBible from '../assets/bible-en.json';
import { Bible } from './bible.types';

@Injectable()
export class BibleService {
  private bn: Bible = bnBible as Bible;
  private en: Bible = enBible as Bible;

  getRandomVerse() {
    const books = this.bn?.Book;

    const bookIndex = Math.floor(Math.random() * books.length);
    const chapterIndex = Math.floor(
      Math.random() * books[bookIndex].Chapter.length,
    );
    const verseIndex = Math.floor(
      Math.random() * books[bookIndex].Chapter[chapterIndex].Verse.length,
    );

    const bnVerse =
      this.bn.Book[bookIndex].Chapter[chapterIndex].Verse[verseIndex];

    const enVerse =
      this.en.Book[bookIndex].Chapter[chapterIndex].Verse[verseIndex];

    return {
      verseId: bnVerse.Verseid,
      text_bn: bnVerse.Verse,
      text_en: enVerse.Verse,
    };
  }
}
