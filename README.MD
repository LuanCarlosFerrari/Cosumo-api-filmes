# Manual do Movie Gallery
## Sistema de Busca e Exibição de Filmes

## Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Componentes Principais](#componentes-principais)
4. [Integração com TMDB](#integração-com-tmdb)
5. [Interface do Usuário](#interface-do-usuário)
6. [Funcionalidades Detalhadas](#funcionalidades-detalhadas)
7. [Guia de Implementação](#guia-de-implementação)
8. [Manutenção e Troubleshooting](#manutenção-e-troubleshooting)

## Visão Geral

O Movie Gallery é uma aplicação web moderna que permite aos usuários buscar e visualizar informações sobre filmes utilizando a API do TMDB (The Movie Database). O sistema é construído com JavaScript puro (Vanilla JS) e segue princípios de programação orientada a objetos.

### Características Principais
- Busca de filmes em tempo real
- Exibição de pôsteres e informações detalhadas
- Acesso a trailers no YouTube
- Sistema de cache para otimização de performance
- Interface responsiva e amigável
- Tratamento de erros robusto

## Arquitetura do Sistema

### Estrutura de Arquivos
```
movie-gallery/
├── index.html          # Arquivo HTML principal
├── styles.css          # Estilos da aplicação
└── script.js           # Código JavaScript principal
```

### Padrão de Arquitetura
O sistema utiliza um padrão de arquitetura em três camadas:
1. **MovieAPI**: Camada de dados e comunicação com API externa
2. **UI**: Camada de interface do usuário
3. **App**: Camada de coordenação e gerenciamento

## Componentes Principais

### 1. Classe MovieAPI
Responsável por toda a comunicação com a API do TMDB.

#### Métodos Principais:
- `constructor(apiKey)`: Inicializa a API com a chave fornecida
- `getGenreNames()`: Busca e faz cache dos gêneros de filmes
- `getMovieInformation(query, withGenres)`: Busca filmes por termo ou top rated
- `getMovieTrailer(movieId)`: Busca trailer do filme no YouTube

### 2. Classe UI
Gerencia toda a interface do usuário e interações DOM.

#### Métodos Principais:
- `displayMovies({ movies, genres })`: Renderiza grid de filmes
- `setupMovieCardEvents(movieCard, movieId)`: Configura eventos dos cartões
- `handleTrailerClick(movieId)`: Gerencia cliques no botão de trailer
- `showMovieDetails(movieId)`: Abre detalhes do filme
- `showLoading(show)`: Controla indicador de carregamento
- `showError(message)`: Exibe mensagens de erro

### 3. Classe App
Coordena a aplicação e gerencia o estado.

#### Métodos Principais:
- `initializeSearchEvents()`: Configura eventos de busca
- `getMovieInformation(query, withGenres)`: Gerencia busca e cache

## Integração com TMDB

### Endpoints Utilizados
1. `/genre/movie/list`: Lista de gêneros
2. `/movie/top_rated`: Filmes mais bem avaliados
3. `/search/movie`: Busca de filmes
4. `/movie/{id}/videos`: Trailers de filmes

### Autenticação
- Utiliza chave de API via parâmetro `api_key`
- A chave deve ser mantida segura e não exposta publicamente

## Interface do Usuário

### Componentes Visuais
1. **Cabeçalho**
   - Logo/título
   - Barra de busca
   - Botão de pesquisa

2. **Grid de Filmes**
   - Cards de filme responsivos
   - Pôsteres com fallback
   - Informações básicas do filme
   - Botões de ação

3. **Elementos de Feedback**
   - Indicador de carregamento
   - Mensagens de erro
   - Notificações de status

### Card de Filme
Cada card contém:
- Pôster do filme
- Título
- Gêneros
- Avaliação média
- Botão de trailer
- Botão de detalhes

## Funcionalidades Detalhadas

### 1. Sistema de Busca
- **Busca em Tempo Real**
  - Ativada após 3 caracteres
  - Debounce de 500ms
  - Cache de resultados

- **Modos de Busca**
  - Por termo/título
  - Filmes mais bem avaliados (default)
  - Filtro por gênero (opcional)

### 2. Sistema de Cache
- Cache de gêneros
- Cache de resultados de busca
- Implementação via Map
- Chaves compostas para filtros

### 3. Tratamento de Erros
- Fallback para imagens não encontradas
- Mensagens de erro amigáveis
- Timeout para notificações
- Logs de erro no console

### 4. Otimizações
- Debounce na busca
- Limite de 16 resultados por página
- Pré-carregamento de gêneros
- Reutilização de elementos DOM

## Guia de Implementação

### 1. Requisitos
- Servidor web básico
- Conexão com internet
- Chave de API do TMDB
- Navegador moderno

### 2. Configuração
1. Clone os arquivos do projeto
2. Substitua a chave de API no script.js
3. Configure o servidor web
4. Acesse via navegador

### 3. Personalização
- Modifique styles.css para alterações visuais
- Ajuste limites de resultados em MovieAPI
- Personalize mensagens de erro
- Modifique tempos de debounce/timeout

## Manutenção e Troubleshooting

### Problemas Comuns
1. **Filmes não carregam**
   - Verificar chave de API
   - Checar console por erros
   - Validar conexão com TMDB

2. **Imagens quebradas**
   - Verificar URLs dos pôsteres
   - Confirmar fallback configurado
   - Checar permissões CORS

3. **Botões não funcionam**
   - Verificar event listeners
   - Confirmar IDs dos elementos
   - Checar erros no console

### Manutenção Preventiva
1. Monitorar uso da API
2. Limpar cache periodicamente
3. Atualizar chave de API
4. Verificar endpoints deprecados

### Logs e Debugging
- Use console.error para erros
- Monitore respostas da API
- Verifique elementos DOM
- Valide dados recebidos

## Conclusão

O Movie Gallery é um sistema robusto e bem estruturado que oferece uma experiência rica ao usuário final enquanto mantém um código organizado e manutenível. A arquitetura em três camadas permite fácil extensão e modificação, enquanto as otimizações implementadas garantem boa performance mesmo com uso intensivo.

Para suporte adicional ou dúvidas, consulte a documentação da API do TMDB ou entre em contato com a equipe de desenvolvimento.