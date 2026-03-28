import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '@auth0/auth0-angular';

export interface FavoriteItem {
  id: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  voteAverage: number;
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly PREFIX = 'favorites_';
  private auth = inject(AuthService);
  private userId: string | null = null;
  private favoritesSubject = new BehaviorSubject<FavoriteItem[]>([]);

  favorites$ = this.favoritesSubject.asObservable();

  constructor() {
    this.auth.user$.subscribe(user => {
      this.userId = user?.sub ?? null;
      this.favoritesSubject.next(this.load());
    });
  }

  private get storageKey(): string {
    return this.userId ? `${this.PREFIX}${this.userId}` : `${this.PREFIX}anonymous`;
  }

  private load(): FavoriteItem[] {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch {
      return [];
    }
  }

  private save(items: FavoriteItem[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
    this.favoritesSubject.next(items);
  }

  isFavorite(id: number, mediaType: string): boolean {
    return this.favoritesSubject.value.some(f => f.id === id && f.mediaType === mediaType);
  }

  toggle(item: FavoriteItem): void {
    const current = this.favoritesSubject.value;
    const exists = current.some(f => f.id === item.id && f.mediaType === item.mediaType);
    if (exists) {
      this.save(current.filter(f => !(f.id === item.id && f.mediaType === item.mediaType)));
    } else {
      this.save([...current, item]);
    }
  }

  remove(id: number, mediaType: string): void {
    this.save(this.favoritesSubject.value.filter(f => !(f.id === id && f.mediaType === mediaType)));
  }
}
