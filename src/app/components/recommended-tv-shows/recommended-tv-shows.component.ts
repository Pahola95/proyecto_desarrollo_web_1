import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MoviesService } from '../../services/movies.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-recommended-tv-shows',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recommended-tv-shows.component.html',
  styleUrls: ['./recommended-tv-shows.component.css'],
})
export class RecommendedTVShowsComponent implements OnInit, OnDestroy {
  private moviesService = inject(MoviesService);
  favService = inject(FavoritesService);

  movies: any[] = [];
  currentApiPage: number = 1;
  carouselIndex: number = 0;
  itemsPerPage: number = 5;
  loading: boolean = false;
  error: string = '';
  ratingMovie: any = null;
  userRating: number = 0;

  get currentMovies(): any[] {
    const start = this.carouselIndex;
    const end = start + this.itemsPerPage;
    return this.movies.slice(start, end);
  }

  ngOnInit(): void {
    this.calculateItemsPerPage();
    this.fetchTrendingMovies(this.currentApiPage);
    window.addEventListener('resize', () => this.onWindowResize());
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize(): void {
    this.calculateItemsPerPage();
    this.carouselIndex = 0;
  }

  calculateItemsPerPage(): void {
    const width = window.innerWidth;
    if (width >= 1400) {
      this.itemsPerPage = 10;
    } else if (width >= 1024) {
      this.itemsPerPage = 5;
    } else if (width >= 768) {
      this.itemsPerPage = 3;
    } else {
      this.itemsPerPage = 1;
    }
  }

  fetchTrendingMovies(page: number): void {
    this.loading = true;
    this.error = '';
    this.moviesService.getRecomendedTVShows(page).subscribe({
      next: (res) => {
        this.movies = res?.results ?? [];
        this.loading = false;
        this.carouselIndex = 0;
      },
      error: () => {
        this.error = 'No se pudieron cargar las películas en tendencia.';
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
    this.fetchTrendingMovies(this.currentApiPage);
  }

  previousPage(): void {
    if (this.currentApiPage > 1) {
      this.currentApiPage--;
      this.fetchTrendingMovies(this.currentApiPage);
    }
  }

  openRatingModal(movie: any): void {
    this.ratingMovie = movie;
    this.userRating = 0;
  }

  submitRating(): void {
    if (this.ratingMovie && this.userRating > 0) {
      this.moviesService
        .rateMovie(this.ratingMovie.id, this.userRating)
        .subscribe({
          next: () => {
            this.ratingMovie = null;
            this.userRating = 0;
          },
          error: (err) => {
            console.error('Error rating movie:', err);
          },
        });
    }
  }

  closeRatingModal(): void {
    this.ratingMovie = null;
    this.userRating = 0;
  }

  setRating(rating: number): void {
    this.userRating = rating;
  }

  toggleFav(movie: any): void {
    this.favService.toggle({
      id: movie.id,
      mediaType: 'tv',
      title: movie.title || movie.name,
      posterPath: movie.poster_path,
      voteAverage: movie.vote_average,
    });
  }

  isFav(movie: any): boolean {
    return this.favService.isFavorite(movie.id, 'tv');
  }
}