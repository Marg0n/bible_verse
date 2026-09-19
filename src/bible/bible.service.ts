/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, Logger } from '@nestjs/common';
import bnBible from '../assets/bible-bn.json';
import enBible from '../assets/bible-en.json';
import { RedisService } from '../redis/redis.service';
import { BOOK_NAMES_BN, BOOK_NAMES_EN } from './bible.constants';
import { Bible, VerseData } from './interface/bible.types';

@Injectable()
export class BibleService {
  constructor(private redisService: RedisService) {}

  private bn: Bible = bnBible as Bible;
  private en: Bible = enBible as Bible;

  //* Nestjs logger
  private readonly logger = new Logger(BibleService.name);

  //* Decode VerseId by VerseId = Book + Chapter + Verse (all encoded)
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
    const verseId = parseInt(bnVerse.Verseid);

    return {
      book_bn: BOOK_NAMES_BN[bookIndex],
      book_en: BOOK_NAMES_EN[bookIndex],
      chapter: decoded.chapter,
      verse: decoded.verse,
      text_bn: bnVerse.Verse,
      text_en: enVerse.Verse,
      verseId: verseId,
    };
  }

  //* Get verse by verse ID
  getVerseById(verseId: string) {
    const decoded = this.decodeVerseId(verseId);

    return this.getVerseByIndex(
      decoded.bookIndex,
      decoded.chapterIndex,
      decoded.verseIndex,
    );
  }

  //* Language filter (separate responsibility)
  private formatByLang(data: VerseData, lang: string) {
    const { text_bn, text_en, book_bn, book_en, ...rest } = data;

    if (lang === 'bn') {
      return {
        ...rest,
        book: book_bn,
        text: data.text_bn,
      };
    }

    if (lang === 'en') {
      return {
        ...rest,
        book: book_en,
        text: data.text_en,
      };
    }

    return {
      ...rest,
      text_bn,
      text_en,
      book_bn,
      book_en,
    };
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

    const result = this.formatByLang(verse, lang);

    return {
      success: true,
      data: result,
    };
  }

  //* get daily verse (Redis used)
  async getDailyVerse(lang: string = 'both') {
    try {
      const today = new Date().toISOString().split('T')[0];

      const redis = this.redisService.getClient();

      //? Create cache key
      const cacheKey = `daily-verse:${today}:${lang}`;

      //? Check cache
      const cached = await redis.get(cacheKey);

      if (cached) {
        this.logger.log(`BIBLE CACHE HIT: ${cacheKey}`);

        return JSON.parse(cached);
      }
      this.logger.log(`BIBLE CACHE HIT: ${cacheKey}`);

      const books = this.bn.Book;

      const hash = this.hashDate(today);

      const bookIndex = hash % books.length;

      const chapterIndex = hash % books[bookIndex].Chapter.length;

      const verseIndex =
        hash % books[bookIndex].Chapter[chapterIndex].Verse.length;

      const verse = this.getVerseByIndex(bookIndex, chapterIndex, verseIndex);

      const result = this.formatByLang(
        {
          date: today,
          ...verse,
        },
        lang,
      );

      const response = {
        success: true,
        data: result,
      };

      //! If cache miss Generate verse.
      await redis.set(cacheKey, JSON.stringify(response), {
        EX: 86400, //? Expires in 60 × 60 × 24 = 24 hours
      });

      return response;
    } catch (error) {
      this.logger.error('Daily verse error: ', error);
    }
  }

  //* Search verses by keyword or phrase
  searchVerses(query: string, lang: string = 'both', limit: number = 10) {
    //? Guard clause: If search box is empty, return an empty array immediately
    if (!query || query.trim() === '') {
      return { success: true, data: [] };
    }

    //? Normalize query to lowercase to make the search case-insensitive
    const searchTerm = query.toLowerCase().trim();
    const results: any[] = [];
    const langSpecific: any[] = [];

    const books = this.bn.Book;

    //? Loop through books, chapters, and verses to find matches
    //? Nested loops: Iterate through books -> chapters -> verses
    for (let bIndex = 0; bIndex < books.length; bIndex++) {
      const book = books[bIndex];
      for (let cIndex = 0; cIndex < book.Chapter.length; cIndex++) {
        const chapter = book.Chapter[cIndex];
        for (let vIndex = 0; vIndex < chapter.Verse.length; vIndex++) {
          //?/ Fetch the unified verse object using your existing helper
          const verse = this.getVerseByIndex(bIndex, cIndex, vIndex);

          //? Check if query matches English or Bengali text
          const matchesEn = verse.text_en.toLowerCase().includes(searchTerm);
          const matchesBn = verse.text_bn.toLowerCase().includes(searchTerm);

          if (matchesEn || matchesBn) {
            //? Format text based on requested language (en, bn, or both)
            const formatted = this.formatByLang(verse, lang);

            langSpecific.push(formatted);

            //? Explicitly attach the index metadata we need!
            // results.push({
            //   ...formatted,
            //   bookIndex: bIndex,
            //   chapterIndex: cIndex,
            //   verseIndex: vIndex,
            // });
            //? Push the raw verse directly without formatByLang
            results.push(verse);

            //? Limit results to keep response payload lightweight for extension popup
            //? Performance guard: Stop searching once we hit the limit (default 10 results)
            if (results.length >= limit) {
              return { success: true, data: results, formatted: langSpecific };
            }
          }
        }
      }
    }

    return {
      success: true,
      data: results,
    };
  }
}
