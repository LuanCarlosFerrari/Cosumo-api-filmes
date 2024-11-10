/**
 * MovieAPI
 * Classe responsável por toda a comunicação com a API do TMDB
 */
class MovieAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.genresCache = null;
    }

    async getGenreNames() {
        if (this.genresCache) return this.genresCache;

        try {
            const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${this.apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            this.genresCache = data.genres.reduce((acc, genre) => {
                acc[genre.id] = genre.name;
                return acc;
            }, {});
            return this.genresCache;
        } catch (error) {
            console.error('Erro ao carregar gêneros:', error);
            return {};
        }
    }

    async getMovieInformation(query, withGenres = null) {
        let url = query.toLowerCase() === 'best'
            ? `https://api.themoviedb.org/3/movie/top_rated?api_key=${this.apiKey}`
            : `https://api.themoviedb.org/3/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`;

        if (withGenres) url += `&with_genres=${withGenres}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            const genres = await this.getGenreNames();
            const movies = data.results.slice(0, 16);
            return { movies, genres };
        } catch (error) {
            console.error('Erro ao buscar filmes:', error);
            throw new Error('Erro ao buscar filmes');
        }
    }

    async getMovieTrailer(movieId) {
        try {
            const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${this.apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            const trailers = data.results.filter(video => video.type === 'Trailer' && video.site === 'YouTube');
            return trailers.length > 0 ? trailers[0].key : null;
        } catch (error) {
            console.error('Erro ao buscar trailer:', error);
            throw new Error('Erro ao buscar trailer');
        }
    }
}

/**
 * UI
 * Classe responsável por toda a interface do usuário
 */
class UI {
    constructor(api) {
        this.api = api;
        this.movieGrid = document.getElementById('movie-grid');
        this.loadingEl = this.createLoadingElement();
        this.errorEl = this.createErrorElement();
    }

    createLoadingElement() {
        const loading = document.createElement('div');
        loading.id = 'loading';
        loading.textContent = 'Carregando...';
        loading.style.display = 'none';
        document.body.appendChild(loading);
        return loading;
    }

    createErrorElement() {
        const error = document.createElement('div');
        error.id = 'error-message';
        error.style.display = 'none';
        document.body.appendChild(error);
        return error;
    }

    showLoading(show) {
        this.loadingEl.style.display = show ? 'block' : 'none';
    }

    showError(message) {
        this.errorEl.textContent = message;
        this.errorEl.style.display = 'block';
        setTimeout(() => this.errorEl.style.display = 'none', 3000);
    }

    async displayMovies({ movies, genres }) {
        if (!this.movieGrid) return;
        
        this.movieGrid.innerHTML = '';
        
        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            
            const posterUrl = movie.poster_path 
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : 'https://via.placeholder.com/500x750?text=No+Poster';

            movieCard.innerHTML = `
                <img src="${posterUrl}" alt="${movie.title}" class="movie-poster" 
                     onerror="this.src='https://via.placeholder.com/500x750?text=No+Poster'">
                <div class="movie-info">
                    <h2 class="movie-title">${movie.title}</h2>
                    <p class="movie-genres">${movie.genre_ids.map(id => genres[id]).join(', ')}</p>
                    <p class="movie-votes">Rating: ${movie.vote_average.toFixed(1)}</p>
                    <div class="movie-buttons">
                        <button class="trailer-button">Trailer</button>
                        <button class="details-button">Detalhes</button>
                    </div>
                </div>
            `;

            this.setupMovieCardEvents(movieCard, movie.id);
            this.movieGrid.appendChild(movieCard);
        });
    }

    setupMovieCardEvents(movieCard, movieId) {
        const posterClick = () => this.showMovieDetails(movieId);
        movieCard.querySelector('.movie-poster').addEventListener('click', posterClick);
        movieCard.querySelector('.trailer-button').addEventListener('click', () => this.handleTrailerClick(movieId));
        movieCard.querySelector('.details-button').addEventListener('click', () => this.showMovieDetails(movieId));
    }

    async handleTrailerClick(movieId) {
        try {
            const trailerKey = await this.api.getMovieTrailer(movieId);
            if (trailerKey) {
                window.open(`https://www.youtube.com/watch?v=${trailerKey}`, '_blank');
            } else {
                this.showError('Trailer não encontrado!');
            }
        } catch (error) {
            this.showError('Erro ao buscar trailer');
        }
    }

    showMovieDetails(movieId) {
        window.open(`https://www.themoviedb.org/movie/${movieId}`, '_blank');
    }
}

/**
 * App
 * Classe principal que coordena MovieAPI e UI
 */
class App {
    constructor(apiKey) {
        this.api = new MovieAPI(apiKey);
        this.ui = new UI(this.api);
        this.searchCache = new Map();
        this.initializeSearchEvents();
        this.getMovieInformation('best');
    }

    initializeSearchEvents() {
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');
        
        if (!searchForm || !searchInput) {
            console.error('Elementos de pesquisa não encontrados');
            return;
        }

        const executeSearch = (query) => {
            if (!query.trim()) {
                this.ui.showError('Por favor, digite algo para pesquisar');
                return;
            }
            
            this.ui.showLoading(true);
            this.getMovieInformation(query)
                .finally(() => this.ui.showLoading(false));
        };

        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            executeSearch(searchInput.value);
        });

        let debounceTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                if (searchInput.value.trim().length >= 3) {
                    executeSearch(searchInput.value);
                }
            }, 500);
        });
    }

    async getMovieInformation(query, withGenres = null) {
        const cacheKey = `${query}-${withGenres || ''}`;
        if (this.searchCache.has(cacheKey)) {
            this.ui.displayMovies(this.searchCache.get(cacheKey));
            return;
        }

        try {
            const data = await this.api.getMovieInformation(query, withGenres);
            if (data.movies.length === 0) {
                this.ui.showError('Nenhum filme encontrado');
                return;
            }

            this.searchCache.set(cacheKey, data);
            this.ui.displayMovies(data);
        } catch (error) {
            this.ui.showError('Erro ao buscar filmes');
        }
    }
}

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    new App("65d9dba8957eebc2b5b4dc05537de1bf");
});