import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MoviesService } from '../../services/movies.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-search-movies',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './search-movies.component.html',
  styleUrls: ['./search-movies.component.css'],
})
export class SearchMoviesComponent implements OnInit, OnDestroy {
  private moviesService = inject(MoviesService);
  favService = inject(FavoritesService);

  movies: any[] = [];
  searchQuery: string = '';
  searchType: 'movie' | 'person' | 'tv' = 'movie';
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

  ngOnInit(): void {
    this.calculateItemsPerPage();
    this.resizeListener = () => {
      this.itemsPerPage = this.calculateItemsPerPage();
      this.carouselIndex = 0;
    };
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy(): void {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  calculateItemsPerPage(): number {
    const width = window.innerWidth;
    if (width < 768) return 1;
    if (width < 1024) return 3;
    if (width < 1400) return 5;
    return 10;
  }

  search(): void {
    if (!this.searchQuery.trim()) {
      this.error = 'Por favor ingresa un término de búsqueda.';
      return;
    }
    
    // Si cambió el tipo de búsqueda, limpiar resultados previos
    if (this.searchType !== this.previousSearchType) {
      this.movies = [];
      this.previousSearchType = this.searchType;
    }
    
    this.currentApiPage = 1;
    this.carouselIndex = 0;
    this.fetchSearchResults(this.searchQuery, this.currentApiPage);
  }

  fetchSearchResults(query: string, page: number): void {
    this.loading = true;
    this.error = '';
    this.hasSearched = true;

    let searchObservable;
    if (this.searchType === 'movie') {
      searchObservable = this.moviesService.searchMovies(query, page);
    } else if (this.searchType === 'person') {
      searchObservable = this.moviesService.searchPerson(query, page);
    } else {
      searchObservable = this.moviesService.searchTV(query, page);
    }

    searchObservable.subscribe({
      next: (res) => {
        this.movies = res?.results ?? [];
        this.loading = false;
        this.carouselIndex = 0;
        if (this.movies.length === 0) {
          this.error = 'No se encontraron resultados con ese término.';
        }
      },
      error: () => {
        this.error = 'Error al buscar. Intenta de nuevo.';
        this.loading = false;
      },
    });
  }

  next(): void {
    if (this.carouselIndex + this.itemsPerPage < this.movies.length) {
      this.carouselIndex++;
    }
  }

  previous(): void {
    if (this.carouselIndex > 0) {
      this.carouselIndex--;
    }
  }

  nextPage(): void {
    this.currentApiPage++;
    this.fetchSearchResults(this.searchQuery, this.currentApiPage);
  }

  previousPage(): void {
    if (this.currentApiPage > 1) {
      this.currentApiPage--;
      this.fetchSearchResults(this.searchQuery, this.currentApiPage);
    }
  }

  get currentMovies(): any[] {
    const start = this.carouselIndex;
    const end = start + this.itemsPerPage;
    return this.movies.slice(start, end);
  }

  openRatingModal(item: any): void {
    if (this.searchType !== 'movie') {
      this.error = 'Solo puedes calificar películas.';
      return;
    }
    this.ratingMovie = item;
    this.userRating = 0;
  }

  closeRatingModal(): void {
    this.ratingMovie = null;
    this.userRating = 0;
  }

  submitRating(): void {
    if (this.ratingMovie && this.userRating > 0) {
      this.ratingLoading = true;
      this.moviesService.rateMovie(this.ratingMovie.id, this.userRating).subscribe({
        next: () => {
          this.ratingLoading = false;
          this.ratingMovie = null;
          this.userRating = 0;
        },
        error: () => {
          this.ratingLoading = false;
          console.error('Error al calificar la película');
        },
      });
    }
  }

  setRating(rating: number): void {
    this.userRating = rating;
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.search();
    }
  }

  getItemTitle(): string {
    if (this.searchType === 'movie') return 'Películas';
    if (this.searchType === 'person') return 'Actores';
    return 'Series de TV';
  }

  getItemName(item: any): string {
    if (this.searchType === 'person') return item.name;
    if (this.searchType === 'tv') return item.name;
    return item.title;
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
    if (this.searchType === 'person') return item.popularity?.toFixed(1) || 'N/A';
    return item.vote_average?.toFixed(1) || 'N/A';
  }

  canRate(): boolean {
    return this.searchType === 'movie';
  }

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
