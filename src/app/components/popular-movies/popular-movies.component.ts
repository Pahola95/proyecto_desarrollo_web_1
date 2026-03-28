import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MoviesService } from '../../services/movies.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-popular-movies',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './popular-movies.component.html',
  styleUrls: ['./popular-movies.component.css'],
})
export class PopularMoviesComponent implements OnInit, OnDestroy {
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
  currentApiPage = 1;
  carouselIndex = 0;
  carouselPage = 1;
  itemsPerPage = this.calculateItemsPerPage();
  private resizeListener: (() => void) | null = null;

  constructor(
    private moviesService: MoviesService
  ) {}

  ngOnInit(): void {
    this.fetchPopularMovies(this.currentApiPage);
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

  private calculateItemsPerPage(): number {
    const width = window.innerWidth;
    if (width < 768) return 1;
    if (width < 1024) return 3;
    if (width < 1400) return 5;
    return 10;
  }

  fetchPopularMovies(page: number): void {
    this.loading = true;
    this.error = '';
    this.moviesService.getPopularMovies(page).subscribe({
      next: (res) => {
        this.movies = res?.results ?? [];
        this.loading = false;
        this.carouselIndex = 0;
      },
      error: () => {
        this.error = 'No se pudieron cargar las películas populares.';
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
    this.fetchPopularMovies(this.currentApiPage);
  }

  previousPage(): void {
    if (this.currentApiPage > 1) {
      this.currentApiPage--;
      this.fetchPopularMovies(this.currentApiPage);
    }
  }

  get currentMovies(): any[] {
    const start = this.carouselIndex;
    const end = start + this.itemsPerPage;
    return this.movies.slice(start, end);
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
      mediaType: 'movie',
      title: movie.title || movie.name,
      posterPath: movie.poster_path,
      voteAverage: movie.vote_average,
    });
  }

  isFav(movie: any): boolean {
    return this.favService.isFavorite(movie.id, 'movie');
  }
}
