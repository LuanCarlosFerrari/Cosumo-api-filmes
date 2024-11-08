import requests

class MovieAPI:
    """
    Classe responsável por interagir com a API de filmes.
    """
    def __init__(self, api_key):
        self.api_key = api_key

    def get_movie_details(self, movie_id):
        """
        Obter detalhes de um filme específico.
        """
        url = f"https://api.themoviedb.org/3/movie/{movie_id}"
        params = {
            "api_key": self.api_key
        }
        response = requests.get(url, params=params)

        if response.status_code == 200:
            return response.json()
        else:
            print(f"Erro ao obter os detalhes do filme: {response.status_code}")
            return None

    def get_movie_trailers(self, movie_id):
        """
        Obter os trailers de um filme específico.
        """
        url = f"https://api.themoviedb.org/3/movie/{movie_id}/videos"
        params = {
            "api_key": self.api_key
        }
        response = requests.get(url, params=params)

        if response.status_code == 200:
            return response.json().get("results", [])
        else:
            print(f"Erro ao obter os trailers do filme: {response.status_code}")
            return []

    def get_genre_names(self, genre_ids):
        """
        Obter os nomes dos gêneros a partir de uma lista de IDs de gênero.
        """
        url = "https://api.themoviedb.org/3/genre/movie/list"
        params = {
            "api_key": self.api_key
        }
        response = requests.get(url, params=params)

        if response.status_code == 200:
            genre_map = {genre["id"]: genre["name"] for genre in response.json()["genres"]}
            return [genre_map[genre_id] for genre_id in genre_ids]
        else:
            print(f"Erro ao obter os nomes dos gêneros: {response.status_code}")
            return []

    def search_movies(self, query, with_genres=None):
        """
        Pesquisar filmes com base em um termo de busca e filtrar por gênero.
        """
        url = "https://api.themoviedb.org/3/search/movie"
        params = {
            "api_key": self.api_key,
            "query": query
        }
        if with_genres:
            params["with_genres"] = with_genres
        response = requests.get(url, params=params)

        if response.status_code == 200:
            return response.json().get("results", [])
        else:
            print(f"Erro ao obter os resultados da pesquisa: {response.status_code}")
            return []

class MovieAnalyzer:
    """
    Classe responsável por analisar e processar as informações dos filmes.
    """
    def __init__(self, movie_api):
        self.movie_api = movie_api

    def get_movie_vote_count(self, movie_id):
        """
        Obter a contagem de votos de um filme específico.
        """
        movie_details = self.movie_api.get_movie_details(movie_id)
        if movie_details:
            vote_count = movie_details.get("vote_count", None)
            if isinstance(vote_count, (int, float)):
                return vote_count
            else:
                print("Erro: Contagem de votos inválida.")
                return None
        else:
            return None

    def get_movie_trailer_key(self, movie_id):
        """
        Obter a chave do trailer de um filme específico.
        """
        trailers = self.movie_api.get_movie_trailers(movie_id)
        for trailer in trailers:
            if trailer["type"] == "Trailer" and trailer["site"] == "YouTube":
                return trailer["key"]
        print("Nenhum trailer oficial encontrado.")
        return None

    def get_movie_information(self, query, with_genres=None):
        """
        Obter informações sobre os filmes com base em um termo de busca e filtrar por gênero.
        """
        movie_data = self.movie_api.search_movies(query, with_genres)
        movies = []
        for movie in movie_data:
            movie_info = {
                "id": movie["id"],
                "title": movie["title"],
                "poster_url": f"https://image.tmdb.org/t/p/w500{movie['poster_path']}",
                "vote_average": movie["vote_average"],
                "genres": self.movie_api.get_genre_names(movie["genre_ids"])
            }
            movies.append(movie_info)
        movies.sort(key=lambda x: x["vote_average"], reverse=True)
        return movies

class MoviePresenter:
    """
    Classe responsável por apresentar as informações dos filmes.
    """
    def __init__(self, movie_analyzer):
        self.movie_analyzer = movie_analyzer

    def display_movie_information(self, movies):
        """
        Exibir as informações de cada filme.
        """
        for movie in movies:
            print(f"ID: {movie['id']}")
            print(f"Título: {movie['title']}")
            print(f"Poster: {movie['poster_url']}")
            print(f"Média de Votos: {movie['vote_average']}")
            print(f"Gêneros: {', '.join(movie['genres'])}")

            vote_count = self.movie_analyzer.get_movie_vote_count(movie["id"])
            if vote_count is not None:
                print(f"Contagem de Votos: {vote_count}")

            trailer_key = self.movie_analyzer.get_movie_trailer_key(movie["id"])
            if trailer_key is not None:
                print(f"Trailer: https://www.youtube.com/watch?v={trailer_key}")

            print("-" * 50)

    def display_popular_movies_by_genre(self, movies):
        """
        Exibir a lista de filmes mais populares por gênero.
        """
        genre_movies = {}
        for movie in movies:
            for genre in movie["genres"]:
                if genre not in genre_movies:
                    genre_movies[genre] = []
                genre_movies[genre].append(movie)

        print("Filmes mais populares por gênero:")
        for genre, genre_movie_list in genre_movies.items():
            print(f"Gênero: {genre}")
            for movie in sorted(genre_movie_list, key=lambda x: x["vote_average"], reverse=True)[:10]:
                print(f"- {movie['title']} (Média de Votos: {movie['vote_average']})")
            print()

# Exemplo de uso
api_key = "65d9dba8957eebc2b5b4dc05537de1bf"
movie_api = MovieAPI(api_key)
movie_analyzer = MovieAnalyzer(movie_api)
movie_presenter = MoviePresenter(movie_analyzer)

movies = movie_analyzer.get_movie_information("thor")
movie_presenter.display_movie_information(movies)

# Filtrar filmes por gênero (exemplo: Filmes de ação)
action_movies = movie_analyzer.get_movie_information("thor", with_genres="28")
movie_presenter.display_popular_movies_by_genre(action_movies)