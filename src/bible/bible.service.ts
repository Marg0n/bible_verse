import { Injectable } from '@nestjs/common';
import bnBible from '../assets/bible-bn.json';
import enBible from '../assets/bible-en.json';
import { Bible } from './bible.types';

@Injectable()
export class BibleService {
  private bn: Bible = bnBible as Bible;
  private en: Bible = enBible as Bible;

  //? Verseid = Book + Chapter + Verse (all encoded)
  private decodeVerseId(id: string) {
    const book = parseInt(id.slice(0, 2), 10);
    const chapter = parseInt(id.slice(2, 5), 10);
    const verse = parseInt(id.slice(5, 8), 10);

    return {
      bookIndex: book,
      chapterIndex: chapter,
      verseIndex: verse,
      book: book + 1,
      chapter: chapter + 1,
      verse: verse + 1,
    };
  }

  //* get random verse
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

    const decoded = this.decodeVerseId(bnVerse.Verseid);

    return {
      book: decoded.book,
      chapter: decoded.chapter,
      verse: decoded.verse,
      text_bn: bnVerse.Verse,
      text_en: enVerse.Verse,
    };
  }

  //* get daily verse
  getDailyVerse(lang: string = 'both') {
    const verse = this.getRandomVerse();

    const today = new Date().toISOString().split('T')[0];

    if (lang === 'bn') {
      return {
        date: today,
        book: verse.book,
        chapter: verse.chapter,
        verse: verse.verse,
        text: verse.text_bn,
      };
    }

    if (lang === 'en') {
      return {
        date: today,
        book: verse.book,
        chapter: verse.chapter,
        verse: verse.verse,
        text: verse.text_en,
      };
    }

    //? for both
    return verse;
  }
}
