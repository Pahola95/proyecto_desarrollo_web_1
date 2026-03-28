import { Injectable } from '@angular/core';

export interface Review {
  movieId: number;
  mediaType: string;
  userName: string;
  userEmail: string;
  rating: number;
  text: string;
  date: string;
}

const STORAGE_KEY = 'app_reviews';

@Injectable({ providedIn: 'root' })
export class ReviewsService {

  private getAll(): Review[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private saveAll(reviews: Review[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  }

  getForMovie(movieId: number, mediaType: string): Review[] {
    return this.getAll().filter(
      (r) => r.movieId === movieId && r.mediaType === mediaType
    );
  }

  getUserReview(movieId: number, mediaType: string, userEmail: string): Review | null {
    return this.getAll().find(
      (r) => r.movieId === movieId && r.mediaType === mediaType && r.userEmail === userEmail
    ) ?? null;
  }

  save(review: Review): void {
    const all = this.getAll().filter(
      (r) => !(r.movieId === review.movieId && r.mediaType === review.mediaType && r.userEmail === review.userEmail)
    );
    all.unshift(review);
    this.saveAll(all);
  }
}
