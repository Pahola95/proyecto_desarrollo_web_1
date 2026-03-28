import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MoviesService } from '../../services/movies.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.css'],
})
export class MovieDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private moviesService = inject(MoviesService);
  private sanitizer = inject(DomSanitizer);
  favService = inject(FavoritesService);

  movie: any = null;
  trailerUrl: SafeResourceUrl | null = null;
  cast: any[] = [];
  similarMovies: any[] = [];
  loading = true;
  mediaType: 'movie' | 'tv' = 'movie';

  ngOnInit(): void {
    this.route.url.subscribe((segments) => {
      this.mediaType = segments[0]?.path === 'tv' ? 'tv' : 'movie';
      const id = Number(segments[1]?.path);
      if (id) this.loadDetails(id);
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
      .subscribe((m) => {
        this.movie = m;
        this.loading = false;
      });

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
      .subscribe((res) => {
        this.cast = (res.cast ?? []).slice(0, 10);
      });

    (isTV ? this.moviesService.getSimilarTv(id) : this.moviesService.getSimilarMovies(id))
      .subscribe((res) => {
        this.similarMovies = (res.results ?? []).slice(0, 8);
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
}
