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
        let url = '';
        if (query.toLowerCase() === 'best') {
            url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${this.apiKey}`;
        } else {
            url = `https://api.themoviedb.org/3/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`;
        }

        if (withGenres) {
            url += `&with_genres=${withGenres}`;
        }

        try {
            const response = await fetch(url);
            const data = await response.json();
            const genres = await this.getGenreNames();
            const movies = data.results || [];
            return { movies, genres };
        } catch (error) {
            console.error('Erro ao buscar filmes:', error);
            throw new Error('Erro ao buscar filmes');
        }
    }

    async getMovieDetails(movieId) {
        try {
            const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${this.apiKey}&append_to_response=credits`;
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Erro ao carregar detalhes:', error);
            throw new Error('Erro ao carregar detalhes do filme');
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

class UI {
    constructor() {
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
        setTimeout(() => {
            this.errorEl.style.display = 'none';
        }, 3000);
    }

    displayMovies({ movies, genres }) {
        if (!this.movieGrid) return;

        this.movieGrid.innerHTML = '';
        
        movies.forEach(movie => {
            const movieGenres = movie.genre_ids.map(id => genres[id]).join(', ');
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            
            const posterUrl = movie.poster_path 
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : 'caminho/para/imagem/padrao.jpg';

            movieCard.innerHTML = `
                <img src="${posterUrl}" alt="${movie.title}" class="movie-poster" 
                     onerror="this.src='caminho/para/imagem/padrao.jpg'">
                <div class="movie-info">
                    <h2 class="movie-title">${movie.title}</h2>
                    <p class="movie-genres">${movieGenres}</p>
                    <p class="movie-votes">Rating: ${movie.vote_average.toFixed(1)}</p>
                    <div class="movie-buttons">
                        <button class="trailer-button">Trailer</button>
                        <button class="details-button">Detalhes</button>
                    </div>
                </div>
            `;

            // Evento para o trailer
            movieCard.querySelector('.trailer-button').addEventListener('click', () => {
                this.onTrailerClick(movie.id);
            });

            // Evento para detalhes
            movieCard.querySelector('.details-button').addEventListener('click', () => {
                this.onDetailsClick(movie.id);
            });

            // Evento para o poster
            movieCard.querySelector('.movie-poster').addEventListener('click', () => {
                window.open(`https://www.themoviedb.org/movie/${movie.id}`, '_blank');
            });

            this.movieGrid.appendChild(movieCard);
        });
    }

    onTrailerClick(movieId) {
        // Placeholder para o evento de clique no trailer
    }

    onDetailsClick(movieId) {
        // Placeholder para o evento de clique nos detalhes
    }
}

class App {
    constructor(apiKey) {
        this.api = new MovieAPI(apiKey);
        this.ui = new UI();
        this.searchCache = new Map();
        this.initializeSearchEvents();
        this.getMovieInformation('best');
    }

    initializeSearchEvents() {
        const searchButton = document.querySelector('[name="search-button"]');
        const searchInput = document.querySelector('[name="search-input"]');
        
        if (!searchButton || !searchInput) {
            console.error('Elementos de pesquisa não encontrados');
            return;
        }

        // Função para executar a pesquisa
        const executeSearch = (query) => {
            if (!query.trim()) {
                this.ui.showError('Por favor, digite algo para pesquisar');
                return;
            }
            
            this.ui.showLoading(true);
            this.getMovieInformation(query)
                .finally(() => this.ui.showLoading(false));
        };

        // Evento de clique no botão
        searchButton.addEventListener('click', () => {
            executeSearch(searchInput.value);
        });

        // Evento de pressionar Enter
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                executeSearch(searchInput.value);
            }
        });

        // Pesquisa automática com debounce
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
        // Verificar cache
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

            // Armazenar no cache
            this.searchCache.set(cacheKey, data);
            
            // Exibir resultados
            this.ui.displayMovies(data);

        } catch (error) {
            this.ui.showError('Erro ao buscar filmes');
        }
    }
}

// Inicializar a aplicação
document.addEventListener('DOMContentLoaded', function() {
    const apiKey = "65d9dba8957eebc2b5b4dc05537de1bf";
    new App(apiKey);
});

document.addEventListener('DOMContentLoaded', function() {
    const api_key = "65d9dba8957eebc2b5b4dc05537de1bf";

    async function getGenreNames() {
        const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${api_key}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.genres.reduce((acc, genre) => {
            acc[genre.id] = genre.name;
            return acc;
        }, {});
    }

    function getMovieInformation(query, withGenres = null) {
        let url = '';
        if (query.toLowerCase() === 'best') {
            // URL para buscar os filmes mais bem avaliados
            url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${api_key}`;
        } else {
            // URL para buscar filmes com base na pesquisa
            url = `https://api.themoviedb.org/3/search/movie?api_key=${api_key}&query=${query}`;
        }
        
        fetch(url)
            .then(response => response.json())
            .then(async data => {
                const genres = await getGenreNames();
                const movies = data.results || []; // Garantir que movies seja um array
                const movieGrid = document.getElementById('movie-grid');
                movieGrid.innerHTML = '';
                if (movies.length === 0) {
                    movieGrid.innerHTML = '<p>No movies found</p>';
                } else {
                    movies.forEach(movie => {
                        const movieGenres = movie.genre_ids.map(id => genres[id]).join(', ');
                        const movieCard = document.createElement('div');
                        movieCard.className = 'movie-card';
                        movieCard.innerHTML = `
                            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="movie-poster">
                            <div class="movie-info">
                                <h2 class="movie-title">${movie.title}</h2>
                                <p class="movie-genres">${movieGenres}</p>
                                <p class="movie-votes">Rating: ${movie.vote_average}</p>
                                <button class="trailer-button">Trailer</button>
                                <button class="details-button">Detalhes</button>
                            </div>
                        `;
                        movieCard.querySelector('.trailer-button').addEventListener('click', () => {
                            getMovieTrailer(movie.id);
                        });
                        movieCard.querySelector('.details-button').addEventListener('click', () => {
                            showMovieDetails(movie.id);
                        });
                        movieCard.querySelector('.movie-poster').addEventListener('click', () => {
                            window.open(`https://www.themoviedb.org/movie/${movie.id}`, '_blank');
                        });
                        movieGrid.appendChild(movieCard);
                    });
                }
            })
            .catch(error => console.log('Error:', error));
    }

    function getMovieTrailer(movieId) {
        const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${api_key}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const trailers = data.results.filter(video => video.type === 'Trailer' && video.site === 'YouTube');
                if (trailers.length > 0) {
                    window.open(`https://www.youtube.com/watch?v=${trailers[0].key}`, '_blank');
                } else {
                    alert('Trailer não encontrado!');
                }
            })
            .catch(error => console.log('Error:', error));
    }

    function showMovieDetails(movieId) {
        window.open(`https://www.themoviedb.org/movie/${movieId}`, '_blank');
    }

    // Adicionar funcionalidade ao botão e campo de pesquisa
    document.getElementsByName('search-button')[0].addEventListener('click', () => {
        const query = document.getElementsByName('search-input')[0].value;
        getMovieInformation(query);
    });

    document.getElementsByName('search-input')[0].addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = document.getElementsByName('search-input')[0].value;
            getMovieInformation(query);
        }
    });

    // Carregar informações dos filmes mais bem avaliados inicialmente
    getMovieInformation('best');
});
