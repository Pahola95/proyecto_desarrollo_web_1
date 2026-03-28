import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Genre {
  id: number;
  name: string;
}

export interface DiscoverParams {
  genreId?: number | null;
  query?: string;
  page?: number;
}

@Injectable({ providedIn: 'root' })
export class GenreService {
  private baseUrl = 'https://api.themoviedb.org/3';
  private bearer =
    'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1OTk2ZGMzMDhmMzcyYjM0ZDcwNGJhZmIxMmEzYTE2OSIsIm5iZiI6MTc3MjMxNTY0MC4yMzIsInN1YiI6IjY5YTM2M2Y4NzQyMDRiMzk2YjQxODI5ZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.lmTsm_Dmxsf-BMhUQuMTbN2JRJA-QL8FFXOU4YkliwQ';

  private get headers(): HttpHeaders {
    return new HttpHeaders()
      .set('Authorization', `Bearer ${this.bearer}`)
      .set('accept', 'application/json');
  }

  constructor(private http: HttpClient) {}

  getMovieGenres(): Observable<{ genres: Genre[] }> {
    return this.http.get<{ genres: Genre[] }>(
      `${this.baseUrl}/genre/movie/list`,
      { headers: this.headers }
    );
  }

  discoverMovies(params: DiscoverParams): Observable<any> {
    let httpParams = new HttpParams().set('page', String(params.page ?? 1));
    if (params.genreId) {
      httpParams = httpParams.set('with_genres', String(params.genreId));
    }
    if (params.query?.trim()) {
      httpParams = httpParams.set('query', params.query.trim());
    }
    // If there's a text query, use search endpoint; otherwise use discover
    const url = params.query?.trim()
      ? `${this.baseUrl}/search/movie`
      : `${this.baseUrl}/discover/movie`;

    return this.http.get<any>(url, { headers: this.headers, params: httpParams });
  }
}
