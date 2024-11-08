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
                            </div>
                        `;
                        movieCard.querySelector('.trailer-button').addEventListener('click', () => {
                            getMovieTrailer(movie.id);
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

    /* Adicionar funcionalidade ao botão e campo de pesquisa
    document.getElementsByName('search-button')[0].addEventListener('click', () => {
        const query = document.getElementsByName('search-input')[0].value;
        getMovieInformation(query);
    });

    document.getElementsByName('search-input')[0].addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = document.getElementsByName('search-input')[0].value;
            getMovieInformation(query);
        }
    });*/

    // Carregar informações dos filmes mais bem avaliados inicialmente
    getMovieInformation('best');
});
