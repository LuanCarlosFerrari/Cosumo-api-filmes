document.addEventListener('DOMContentLoaded', function() {
    const api_key = "65d9dba8957eebc2b5b4dc05537de1bf";

    function getMovieInformation(query, withGenres = null) {
        const url = `https://api.themoviedb.org/3/search/movie?api_key=${api_key}&query=${query}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const movies = data.results;
                const movieGrid = document.getElementById('movie-grid');
                movieGrid.innerHTML = '';
                movies.forEach(movie => {
                    const movieCard = document.createElement('div');
                    movieCard.className = 'movie-card';
                    getGenres(movie.genre_ids).then(genres => {
                        movieCard.innerHTML = `
                            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                            <div class="movie-info">
                                <h2 class="movie-title">${movie.title}</h2>
                                <p class="movie-genres">${genres.join(', ')}</p>
                                <p class="movie-votes">Rating: ${movie.vote_average}</p>
                                <a class="trailer-button" onclick="getMovieTrailer(${movie.id})">Trailer</a>
                            </div>
                        `;
                        movieGrid.appendChild(movieCard);
                    });
                });
            })
            .catch(error => console.log('Error:', error));
    }

    function getGenres(genreIds) {
        const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${api_key}`;
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                const genreMap = {};
                data.genres.forEach(genre => {
                    genreMap[genre.id] = genre.name;
                });
                return genreIds.map(id => genreMap[id]);
            })
            .catch(error => {
                console.log('Error:', error);
                return [];
            });
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
    /*Adicionar funcionalidade ao botão e campo de pesquisa
    document.getElementsByName('search-button')[0].addEventListener('click', () => {
        const query = document.getElementsByName('search-input')[0].value;
        getMovieInformation(query);
    });

    ocument.getElementsByName('search-input')[0].addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = document.getElementsByName('search-input')[0].value;
            getMovieInformation(query);
        }
    });*/

    // Carregar informações dos filmes iniciais
    getMovieInformation('best');
});