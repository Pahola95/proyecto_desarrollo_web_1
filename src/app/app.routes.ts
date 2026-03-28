import { Routes } from '@angular/router';
import { AuthGuard } from '@auth0/auth0-angular';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		loadComponent: () =>
			import('./components/home/home.component').then((m) => m.HomeComponent),
	},
	{
		path: 'callback',
		pathMatch: 'full',
		loadComponent: () =>
			import('./components/auth-callback/auth-callback.component').then((m) => m.AuthCallbackComponent),
	},
	{
		path: 'movies',
		pathMatch: 'full',
		loadComponent: () =>
			import('./components/movies/movies.component').then((m) => m.MoviesComponent),
		canActivate: [AuthGuard],
	},
	{
		path: 'popular',
		pathMatch: 'full',
		loadComponent: () =>
			import('./components/popular-movies/popular-movies.component').then((m) => m.PopularMoviesComponent),
		canActivate: [AuthGuard],
	},
	{
		path: 'recommended',
		pathMatch: 'full',
		loadComponent: () =>
			import('./components/recommended-tv-shows/recommended-tv-shows.component').then((m) => m.RecommendedTVShowsComponent),
		canActivate: [AuthGuard],
	},
	{
		path: 'search',
		pathMatch: 'full',
		loadComponent: () =>
			import('./components/search-movies/search-movies.component').then((m) => m.SearchMoviesComponent),
		canActivate: [AuthGuard],
	},
	{
		path: 'profile',
		pathMatch: 'full',
		loadComponent: () =>
			import('./components/profile/profile.component').then((m) => m.ProfileComponent),
		canActivate: [AuthGuard],
	},
	{
		path: 'movie/:id',
		loadComponent: () =>
			import('./components/movie-detail/movie-detail.component').then((m) => m.MovieDetailComponent),
		canActivate: [AuthGuard],
	},
	{
		path: 'tv/:id',
		loadComponent: () =>
			import('./components/movie-detail/movie-detail.component').then((m) => m.MovieDetailComponent),
		canActivate: [AuthGuard],
	},
	{
		path: 'favorites',
		pathMatch: 'full',
		loadComponent: () =>
			import('./components/favorites/favorites.component').then((m) => m.FavoritesComponent),
		canActivate: [AuthGuard],
	},
	{ path: '**', redirectTo: '' },
];

