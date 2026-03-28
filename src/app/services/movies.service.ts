import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MoviesService {
  private baseUrl = 'https://api.themoviedb.org/3';

  private bearer =
    'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1OTk2ZGMzMDhmMzcyYjM0ZDcwNGJhZmIxMmEzYTE2OSIsIm5iZiI6MTc3MjMxNTY0MC4yMzIsInN1YiI6IjY5YTM2M2Y4NzQyMDRiMzk2YjQxODI5ZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.lmTsm_Dmxsf-BMhUQuMTbN2JRJA-QL8FFXOU4YkliwQ';

  constructor(private http: HttpClient) {}

  getPopularMovies(page: number = 1): Observable<any> {
    const url = `${this.baseUrl}/movie/popular`;
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.bearer}`)
      .set('accept', 'application/json');
    const params = new HttpParams().set('page', String(page));
    return this.http.get<any>(url, { headers, params });
  }
   getTrendingMovies(page: number = 1): Observable<any> {
    const url = `${this.baseUrl}/trending/all/day`;
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.bearer}`)
      .set('accept', 'application/json');
    const params = new HttpParams().set('page', String(page));
    return this.http.get<any>(url, { headers, params });
  }

  getRecomendedTVShows(page: number = 1): Observable<any> {
    const url = `${this.baseUrl}/tv/top_rated`;
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.bearer}`)
      .set('accept', 'application/json');
    const params = new HttpParams().set('page', String(page));
    return this.http.get<any>(url, { headers, params });
  }

  searchMovies(query: string, page: number = 1): Observable<any> {
    const url = `${this.baseUrl}/search/movie`;
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.bearer}`)
      .set('accept', 'application/json');
    const params = new HttpParams()
      .set('query', query)
      .set('page', String(page));
    return this.http.get<any>(url, { headers, params });
  }

  searchPerson(query: string, page: number = 1): Observable<any> {
    const url = `${this.baseUrl}/search/person`;
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.bearer}`)
      .set('accept', 'application/json');
    const params = new HttpParams()
      .set('query', query)
      .set('page', String(page));
    return this.http.get<any>(url, { headers, params });
  }

  searchTV(query: string, page: number = 1): Observable<any> {
    const url = `${this.baseUrl}/search/tv`;
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.bearer}`)
      .set('accept', 'application/json');
    const params = new HttpParams()
      .set('query', query)
      .set('page', String(page));
    return this.http.get<any>(url, { headers, params });
  }

  rateMovie(movieId: number, rating: number): Observable<any> {
  return this.http.post(
    `${this.baseUrl}/movie/${movieId}/rating`,
    { value: rating },
    {
      headers: {
        'Authorization': `Bearer ${this.bearer}`,
        'Content-Type': 'application/json;charset=utf-8'
      }
    }
  );
}

  getMovieDetails(movieId: number): Observable<any> {
    const url = `${this.baseUrl}/movie/${movieId}`;
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.bearer}`)
      .set('accept', 'application/json');
    return this.http.get<any>(url, { headers });
  }

  getMovieVideos(movieId: number): Observable<any> {
    const url = `${this.baseUrl}/movie/${movieId}/videos`;
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.bearer}`)
      .set('accept', 'application/json');
    return this.http.get<any>(url, { headers });
  }

  getMovieCredits(movieId: number): Observable<any> {
    const url = `${this.baseUrl}/movie/${movieId}/credits`;
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.bearer}`)
      .set('accept', 'application/json');
    return this.http.get<any>(url, { headers });
  }

  getSimilarMovies(movieId: number): Observable<any> {
    const url = `${this.baseUrl}/movie/${movieId}/similar`;
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.bearer}`)
      .set('accept', 'application/json');
    return this.http.get<any>(url, { headers });
  }

  getTvDetails(tvId: number): Observable<any> {
    const url = `${this.baseUrl}/tv/${tvId}`;
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.bearer}`)
      .set('accept', 'application/json');
    return this.http.get<any>(url, { headers });
  }

  getTvVideos(tvId: number): Observable<any> {
    const url = `${this.baseUrl}/tv/${tvId}/videos`;
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.bearer}`)
      .set('accept', 'application/json');
    return this.http.get<any>(url, { headers });
  }

  getTvCredits(tvId: number): Observable<any> {
    const url = `${this.baseUrl}/tv/${tvId}/credits`;
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.bearer}`)
      .set('accept', 'application/json');
    return this.http.get<any>(url, { headers });
  }

  getSimilarTv(tvId: number): Observable<any> {
    const url = `${this.baseUrl}/tv/${tvId}/similar`;
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.bearer}`)
      .set('accept', 'application/json');
    return this.http.get<any>(url, { headers });
  }
}
