/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import bnBible from '../assets/bible-bn.json';
import enBible from '../assets/bible-en.json';
import { Bible } from './bible.types';
import { BOOK_NAMES_BN, BOOK_NAMES_EN } from './bible.constants';

@Injectable()
export class BibleService {
  private bn: Bible = bnBible as Bible;
  private en: Bible = enBible as Bible;

  //* Decode VerseId by Verseid = Book + Chapter + Verse (all encoded)
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

  //* Hash Function which converts date to a number
  private hashDate(date: string): number {
    let hash = 0;

    for (let i = 0; i < date.length; i++) {
      hash = date.charCodeAt(i) + ((hash << 5) - hash);
    }

    return Math.abs(hash);
  }

  //* Core: Build verse from index (SINGLE SOURCE OF TRUTH)
  private getVerseByIndex(
    bookIndex: number,
    chapterIndex: number,
    verseIndex: number,
  ) {
    const bnVerse =
      this.bn.Book[bookIndex].Chapter[chapterIndex].Verse[verseIndex];

    const enVerse =
      this.en.Book[bookIndex].Chapter[chapterIndex].Verse[verseIndex];

    const decoded = this.decodeVerseId(bnVerse.Verseid);

    return {
      book_bn: BOOK_NAMES_BN[bookIndex],
      book_en: BOOK_NAMES_EN[bookIndex],
      chapter: decoded.chapter,
      verse: decoded.verse,
      text_bn: bnVerse.Verse,
      text_en: enVerse.Verse,
    };
  }

  //* Language filter (separate responsibility)
  private formatByLang(data: any, lang: string) {
    if (lang === 'bn') {
      return { ...data, text: data.text_bn };
    }

    if (lang === 'en') {
      return { ...data, text: data.text_en };
    }

    return data; // both
  }

  //* get random verse
  getRandomVerse(lang: string = 'both') {
    const books = this.bn?.Book;

    const bookIndex = Math.floor(Math.random() * books.length);
    const chapterIndex = Math.floor(
      Math.random() * books[bookIndex].Chapter.length,
    );
    const verseIndex = Math.floor(
      Math.random() * books[bookIndex].Chapter[chapterIndex].Verse.length,
    );

    const verse = this.getVerseByIndex(bookIndex, chapterIndex, verseIndex);

    return this.formatByLang(verse, lang);
  }

  //* get daily verse
  getDailyVerse(lang: string = 'both') {
    const today = new Date().toISOString().split('T')[0];

    const books = this.bn.Book;

    const hash = this.hashDate(today);

    const bookIndex = hash % books.length;

    const chapterIndex = hash % books[bookIndex].Chapter.length;

    const verseIndex =
      hash % books[bookIndex].Chapter[chapterIndex].Verse.length;

    const verse = this.getVerseByIndex(bookIndex, chapterIndex, verseIndex);

    return this.formatByLang(
      {
        date: today,
        ...verse,
      },
      lang,
    );
  }
}
