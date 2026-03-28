import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@auth0/auth0-angular';
import { take } from 'rxjs';
import { MoviesService } from '../../services/movies.service';
import { FavoritesService } from '../../services/favorites.service';
import { ReviewsService, Review } from '../../services/reviews.service';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.css'],
})
export class MovieDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private moviesService = inject(MoviesService);
  private sanitizer = inject(DomSanitizer);
  private fb = inject(FormBuilder);
  private reviewsService = inject(ReviewsService);
  auth = inject(AuthService);
  favService = inject(FavoritesService);

  movie: any = null;
  trailerUrl: SafeResourceUrl | null = null;
  cast: any[] = [];
  similarMovies: any[] = [];
  loading = true;
  mediaType: 'movie' | 'tv' = 'movie';

  // Review
  reviewForm!: FormGroup;
  allReviews: Review[] = [];
  reviewSaved = false;
  readonly stars = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  ngOnInit(): void {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(10)]],
      text: ['', [Validators.required, Validators.minLength(10)]],
    });

    this.route.url.subscribe((segments) => {
      this.mediaType = segments[0]?.path === 'tv' ? 'tv' : 'movie';
      const id = Number(segments[1]?.path);
      if (id) {
        this.loadDetails(id);
        this.loadReviews(id);
      }
    });
  }

  private loadDetails(id: number): void {
    this.loading = true;
    this.movie = null;
    this.trailerUrl = null;
    this.cast = [];
    this.similarMovies = [];

    const isTV = this.mediaType === 'tv';

    (isTV ? this.moviesService.getTvDetails(id) : this.moviesService.getMovieDetails(id))
      .subscribe((m) => { this.movie = m; this.loading = false; });

    (isTV ? this.moviesService.getTvVideos(id) : this.moviesService.getMovieVideos(id))
      .subscribe((res) => {
        const trailer = (res.results ?? []).find(
          (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
        );
        if (trailer) {
          this.trailerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            `https://www.youtube.com/embed/${trailer.key}`
          );
        }
      });

    (isTV ? this.moviesService.getTvCredits(id) : this.moviesService.getMovieCredits(id))
      .subscribe((res) => { this.cast = (res.cast ?? []).slice(0, 10); });

    (isTV ? this.moviesService.getSimilarTv(id) : this.moviesService.getSimilarMovies(id))
      .subscribe((res) => { this.similarMovies = (res.results ?? []).slice(0, 8); });
  }

  private loadReviews(id: number): void {
    this.allReviews = this.reviewsService.getForMovie(id, this.mediaType);

    // Pre-fill form if current user already reviewed
    this.auth.user$.pipe(take(1)).subscribe((user) => {
      if (!user?.email) return;
      const mine = this.reviewsService.getUserReview(id, this.mediaType, user.email);
      if (mine) {
        this.reviewForm.patchValue({ rating: mine.rating, text: mine.text });
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  get isFavorite(): boolean {
    return this.movie ? this.favService.isFavorite(this.movie.id, this.mediaType) : false;
  }

  toggleFavorite(): void {
    if (!this.movie) return;
    this.favService.toggle({
      id: this.movie.id,
      mediaType: this.mediaType,
      title: this.movie.title || this.movie.name,
      posterPath: this.movie.poster_path,
      voteAverage: this.movie.vote_average,
    });
  }

  setStarRating(star: number): void {
    this.reviewForm.patchValue({ rating: star });
  }

  saveReview(): void {
    if (this.reviewForm.invalid || !this.movie) return;

    this.auth.user$.pipe(take(1)).subscribe((user) => {
      const review: Review = {
        movieId: this.movie.id,
        mediaType: this.mediaType,
        userName: user?.name || user?.email || 'Anónimo',
        userEmail: user?.email || '',
        rating: this.reviewForm.value.rating,
        text: this.reviewForm.value.text,
        date: new Date().toISOString(),
      };
      this.reviewsService.save(review);
      this.allReviews = this.reviewsService.getForMovie(this.movie.id, this.mediaType);
      this.reviewSaved = true;
      setTimeout(() => (this.reviewSaved = false), 3000);
    });
  }
}
