import { noticiasData } from "@/pages/noticiasData";

export interface HomeNewsItem {
  slug: string;
  title: string;
  date: string;
  dateFormatted: string;
  excerpt: string;
}

export const homeNews: HomeNewsItem[] = noticiasData
  .slice()
  .sort((a, b) => (a.date < b.date ? 1 : -1))
  .map((item) => ({
    slug: item.slug,
    title: item.title,
    date: item.date,
    dateFormatted: item.dateFormatted,
    excerpt: item.excerpt,
  }));
