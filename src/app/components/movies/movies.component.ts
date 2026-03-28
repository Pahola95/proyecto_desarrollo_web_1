import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MoviesService } from '../../services/movies.service';
import { FavoritesService } from '../../services/favorites.service';
import { PopularMoviesComponent } from "../popular-movies/popular-movies.component";
import { RecommendedTVShowsComponent } from "../recommended-tv-shows/recommended-tv-shows.component";

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [CommonModule, FormsModule, PopularMoviesComponent, RecommendedTVShowsComponent, RouterLink],
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.css'],
})
export class MoviesComponent implements OnInit, OnDestroy {
  favService = inject(FavoritesService);
  movies: any[] = [];
  loading = true;
  error = '';
  showRatingModal = false;
  selectedMovieId: number | null = null;
  selectedMovieTitle = '';
  selectedMovieOverView = '';
  userRating = 0;
  ratingLoading = false;
  ratingError = '';
  currentPage = 0;
  itemsPerPage = this.calculateItemsPerPage();
  carouselPage = 1;
  private resizeListener: (() => void) | null = null;

  constructor(
    private moviesService: MoviesService
  ) {}

  ngOnInit(): void {
    this.fetchMovies(this.carouselPage);
    this.resizeListener = () => {
      const newItemsPerPage = this.calculateItemsPerPage();
      if (newItemsPerPage !== this.itemsPerPage) {
        this.itemsPerPage = newItemsPerPage;
        this.currentPage = 0; // Reset carousel position when resizing
      }
    };
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy(): void {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  private calculateItemsPerPage(): number {
    const width = window.innerWidth;
    if (width < 480) return 2;      // Mobile: 2 items
    if (width < 768) return 3;      // Tablet: 3 items
    if (width < 992) return 4;      // Small desktop: 4 items
    if (width < 1200) return 5;     // Medium desktop: 5 items
    return 6;                        // Large desktop: 6 items
  }

  nextSlide(): void {
    const maxPages = Math.ceil(this.movies.length / this.itemsPerPage);
    if (this.currentPage < maxPages - 1) {
      this.currentPage++;
    }
  }

  previousSlide(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    this.carouselPage++;
    this.currentPage = 0;
    this.fetchMovies(this.carouselPage);
  }

  previousPage(): void {
    if (this.carouselPage > 1) {
      this.carouselPage--;
      this.currentPage = 0;
      this.fetchMovies(this.carouselPage);
    }
  }

  getVisibleMovies(): any[] {
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.movies.slice(start, end);
  }

  getMaxPages(): number {
    return Math.ceil(this.movies.length / this.itemsPerPage);
  }

  fetchMovies(page: number = 1): void {
    this.loading = true;
    this.error = '';
    this.moviesService.getTrendingMovies(page).subscribe({
      next: (res) => {
        this.movies = res?.results ?? [];
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las películas.';
        this.loading = false;
      },
    });
  }

  openRatingModal(movieId: number, movieTitle: string, movieOverview: string): void {
    this.selectedMovieId = movieId;
    this.selectedMovieTitle = movieTitle;
    this.selectedMovieOverView = movieOverview;
    this.userRating = 0;
    this.ratingError = '';
    this.showRatingModal = true;
  }

  closeRatingModal(): void {
    this.showRatingModal = false;
    this.selectedMovieId = null;
    this.userRating = 0;
  }

  submitRating(): void {
    if (!this.selectedMovieId || this.userRating === 0) {
      this.ratingError = 'Por favor selecciona una calificación.';
      return;
    }

    this.ratingLoading = true;
    this.ratingError = '';

    this.moviesService.rateMovie(this.selectedMovieId, this.userRating).subscribe({
      next: () => {
        this.ratingLoading = false;
        this.closeRatingModal();
        alert('¡Película calificada exitosamente!');
      },
      error: (error) => {
        this.ratingLoading = false;
      },
    });
  }

  setRating(rating: number): void {
    this.userRating = rating;
  }

  toggleFav(movie: any): void {
    this.favService.toggle({
      id: movie.id,
      mediaType: movie.media_type || 'movie',
      title: movie.title || movie.name,
      posterPath: movie.poster_path,
      voteAverage: movie.vote_average,
    });
  }

  isFav(movie: any): boolean {
    return this.favService.isFavorite(movie.id, movie.media_type || 'movie');
  }
}