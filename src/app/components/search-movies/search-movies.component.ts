import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, combineLatest, debounceTime, distinctUntilChanged, switchMap, takeUntil, of } from 'rxjs';
import { MoviesService } from '../../services/movies.service';
import { FavoritesService } from '../../services/favorites.service';
import { GenreService, Genre } from '../../services/genre.service';

@Component({
  selector: 'app-search-movies',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './search-movies.component.html',
  styleUrls: ['./search-movies.component.css'],
})
export class SearchMoviesComponent implements OnInit, OnDestroy {
  private moviesService = inject(MoviesService);
  private genreService = inject(GenreService);
  favService = inject(FavoritesService);

  movies: any[] = [];
  searchQuery: string = '';
  searchType: 'movie' | 'person' | 'tv' = 'movie';
  selectedGenreId: number | null = null;
  genres: Genre[] = [];
  currentApiPage: number = 1;
  carouselIndex: number = 0;
  itemsPerPage: number = 5;
  loading: boolean = false;
  error: string = '';
  hasSearched: boolean = false;
  ratingMovie: any = null;
  userRating: number = 0;
  ratingLoading: boolean = false;

  private resizeListener: (() => void) | null = null;
  private previousSearchType: 'movie' | 'person' | 'tv' = 'movie';
  private destroy$ = new Subject<void>();
  private movieFilter$ = new Subject<{ query: string; genreId: number | null; page: number }>();

  ngOnInit(): void {
    this.calculateItemsPerPage();
    this.resizeListener = () => {
      this.itemsPerPage = this.calculateItemsPerPage();
      this.carouselIndex = 0;
    };
    window.addEventListener('resize', this.resizeListener);

    // Load genres for the filter
    this.genreService.getMovieGenres().subscribe({
      next: (res) => (this.genres = res.genres),
    });

    // Reactive pipeline with debounce for movie searches
    this.movieFilter$
      .pipe(
        debounceTime(400),
        distinctUntilChanged((a, b) =>
          a.query === b.query && a.genreId === b.genreId && a.page === b.page
        ),
        switchMap((params) => {
          // Only trigger if there's a query OR a genre selected
          if (!params.query.trim() && !params.genreId) return of(null);
          this.loading = true;
          this.error = '';
          this.hasSearched = true;
          return this.genreService.discoverMovies({
            query: params.query,
            genreId: params.genreId,
            page: params.page,
          });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          if (res === null) return;
          this.movies = res?.results ?? [];
          this.loading = false;
          this.carouselIndex = 0;
          if (this.movies.length === 0) {
            this.error = 'No se encontraron resultados.';
          }
        },
        error: () => {
          this.error = 'Error al buscar. Intenta de nuevo.';
          this.loading = false;
        },
      });
  }

  ngOnDestroy(): void {
    if (this.resizeListener) window.removeEventListener('resize', this.resizeListener);
    this.destroy$.next();
    this.destroy$.complete();
  }

  calculateItemsPerPage(): number {
    const width = window.innerWidth;
    if (width < 768) return 1;
    if (width < 1024) return 3;
    if (width < 1400) return 5;
    return 10;
  }

  private emitFilter(): void {
    this.movieFilter$.next({
      query: this.searchQuery,
      genreId: this.selectedGenreId,
      page: this.currentApiPage,
    });
  }

  // Called when user types in the search input
  onQueryChange(): void {
    if (this.searchType !== 'movie') return;
    this.currentApiPage = 1;
    this.emitFilter();
  }

  // Called when genre select changes
  onGenreChange(): void {
    this.currentApiPage = 1;
    this.carouselIndex = 0;
    this.emitFilter();
  }

  search(): void {
    if (this.searchType !== 'movie') {
      this.runLegacySearch();
      return;
    }
    if (!this.searchQuery.trim() && !this.selectedGenreId) {
      this.error = 'Ingresa un término o selecciona un género.';
      return;
    }
    this.currentApiPage = 1;
    this.emitFilter();
  }

  // Legacy search for person / tv (unchanged behavior)
  private runLegacySearch(): void {
    if (!this.searchQuery.trim()) {
      this.error = 'Por favor ingresa un término de búsqueda.';
      return;
    }
    if (this.searchType !== this.previousSearchType) {
      this.movies = [];
      this.previousSearchType = this.searchType;
    }
    this.currentApiPage = 1;
    this.carouselIndex = 0;
    this.fetchLegacyResults(this.searchQuery, this.currentApiPage);
  }

  fetchLegacyResults(query: string, page: number): void {
    this.loading = true;
    this.error = '';
    this.hasSearched = true;

    const obs = this.searchType === 'person'
      ? this.moviesService.searchPerson(query, page)
      : this.moviesService.searchTV(query, page);

    obs.subscribe({
      next: (res) => {
        this.movies = res?.results ?? [];
        this.loading = false;
        this.carouselIndex = 0;
        if (this.movies.length === 0) this.error = 'No se encontraron resultados.';
      },
      error: () => {
        this.error = 'Error al buscar. Intenta de nuevo.';
        this.loading = false;
      },
    });
  }

  next(): void {
    if (this.carouselIndex + this.itemsPerPage < this.movies.length) this.carouselIndex++;
  }

  previous(): void {
    if (this.carouselIndex > 0) this.carouselIndex--;
  }

  nextPage(): void {
    this.currentApiPage++;
    if (this.searchType === 'movie') {
      this.emitFilter();
    } else {
      this.fetchLegacyResults(this.searchQuery, this.currentApiPage);
    }
  }

  previousPage(): void {
    if (this.currentApiPage > 1) {
      this.currentApiPage--;
      if (this.searchType === 'movie') {
        this.emitFilter();
      } else {
        this.fetchLegacyResults(this.searchQuery, this.currentApiPage);
      }
    }
  }

  get currentMovies(): any[] {
    return this.movies.slice(this.carouselIndex, this.carouselIndex + this.itemsPerPage);
  }

  openRatingModal(item: any): void {
    if (this.searchType !== 'movie') { this.error = 'Solo puedes calificar películas.'; return; }
    this.ratingMovie = item;
    this.userRating = 0;
  }

  closeRatingModal(): void { this.ratingMovie = null; this.userRating = 0; }

  submitRating(): void {
    if (this.ratingMovie && this.userRating > 0) {
      this.ratingLoading = true;
      this.moviesService.rateMovie(this.ratingMovie.id, this.userRating).subscribe({
        next: () => { this.ratingLoading = false; this.ratingMovie = null; this.userRating = 0; },
        error: () => { this.ratingLoading = false; },
      });
    }
  }

  setRating(rating: number): void { this.userRating = rating; }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.search();
  }

  getItemTitle(): string {
    if (this.searchType === 'movie') return 'Películas';
    if (this.searchType === 'person') return 'Actores';
    return 'Series de TV';
  }

  getItemName(item: any): string {
    return this.searchType === 'person' ? item.name : (item.title || item.name);
  }

  getItemReleaseDate(item: any): string {
    if (this.searchType === 'person') return item.known_for_department || 'N/A';
    if (this.searchType === 'tv') return item.first_air_date || 'N/A';
    return item.release_date || 'N/A';
  }

  getItemImage(item: any): string | null {
    return item.poster_path || item.profile_path || null;
  }

  getItemRating(item: any): string {
    return this.searchType === 'person'
      ? item.popularity?.toFixed(1) || 'N/A'
      : item.vote_average?.toFixed(1) || 'N/A';
  }

  canRate(): boolean { return this.searchType === 'movie'; }

  toggleFav(item: any): void {
    if (this.searchType === 'person') return;
    this.favService.toggle({
      id: item.id,
      mediaType: this.searchType as 'movie' | 'tv',
      title: item.title || item.name,
      posterPath: item.poster_path,
      voteAverage: item.vote_average,
    });
  }

  isFav(item: any): boolean {
    if (this.searchType === 'person') return false;
    return this.favService.isFavorite(item.id, this.searchType);
  }
}
