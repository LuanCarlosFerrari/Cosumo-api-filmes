/**
 * ANÁLISE DETALHADA DO CÓDIGO DE APLICAÇÃO DE FILMES
 * 
 * VISÃO GERAL:
 * Este código implementa uma aplicação web para busca e exibição de filmes usando a API do TMDB (The Movie Database).
 * A aplicação é estruturada em três classes principais: MovieAPI, UI e App.
 * 
 * ESTRUTURA DO CÓDIGO:
 * 
 * 1. CLASSE MovieAPI
 * ==================
 * Responsável por toda a comunicação com a API do TMDB.
 * 
 * Métodos principais:
 * - constructor(apiKey): Inicializa a API com a chave fornecida
 * - getGenreNames(): 
 *   - Busca e cache dos gêneros de filmes
 *   - Implementa cache para evitar requisições repetidas
 *   - Retorna um objeto mapeando IDs para nomes de gêneros
 * 
 * - getMovieInformation(query, withGenres):
 *   - Busca filmes baseado em uma query ou retorna os mais bem avaliados
 *   - Suporta filtro por gêneros
 *   - Limita resultados a 16 filmes
 * 
 * - getMovieDetails(movieId):
 *   - Busca detalhes específicos de um filme
 *   - Inclui informações de créditos (elenco, equipe)
 * 
 * - getMovieTrailer(movieId):
 *   - Busca trailers do YouTube para um filme específico
 *   - Filtra apenas por vídeos do tipo 'Trailer' do YouTube
 * 
 * 2. CLASSE UI
 * ============
 * Gerencia toda a interface do usuário e interações DOM.
 * 
 * Componentes principais:
 * - Loading indicator
 * - Mensagens de erro
 * - Grid de filmes
 * 
 * Métodos principais:
 * - constructor(): Inicializa elementos UI básicos
 * - createLoadingElement(): Cria elemento de loading
 * - createErrorElement(): Cria elemento para mensagens de erro
 * - showLoading(show): Controla visibilidade do loading
 * - showError(message): Exibe mensagens de erro temporárias (3 segundos)
 * 
 * - displayMovies({ movies, genres }):
 *   - Renderiza grid de filmes
 *   - Cria cards para cada filme com:
 *     * Poster
 *     * Título
 *     * Gêneros
 *     * Avaliação
 *     * Botões de trailer e detalhes
 *   - Implementa handlers para cliques em:
 *     * Poster (abre TMDB)
 *     * Botão de trailer
 *     * Botão de detalhes
 * 
 * 3. CLASSE App
 * =============
 * Classe principal que coordena MovieAPI e UI.
 * 
 * Funcionalidades principais:
 * - Gerenciamento de cache de busca
 * - Inicialização de eventos de busca
 * - Implementação de debounce na busca (500ms)
 * 
 * Métodos principais:
 * - constructor(apiKey): 
 *   - Inicializa API e UI
 *   - Configura cache
 *   - Inicia com filmes mais bem avaliados
 * 
 * - initializeSearchEvents():
 *   - Configura eventos de busca:
 *     * Clique no botão
 *     * Tecla Enter
 *     * Busca automática após 3 caracteres
 *   - Implementa debounce para evitar muitas requisições
 * 
 * - getMovieInformation(query, withGenres):
 *   - Gerencia cache de busca
 *   - Coordena exibição de resultados
 *   - Tratamento de erros
 * 
 * FEATURES DE DESTAQUE:
 * ====================
 * 1. Sistema de Cache:
 *    - Cache de gêneros
 *    - Cache de resultados de busca
 * 
 * 2. Otimizações de Performance:
 *    - Debounce na busca
 *    - Limite de 16 filmes por busca
 *    - Sistema de cache
 * 
 * 3. Tratamento de Erros:
 *    - Feedback visual para usuário
 *    - Fallbacks para imagens não encontradas
 *    - Validação de entrada de busca
 * 
 * 4. UX/UI:
 *    - Loading indicator
 *    - Mensagens de erro temporárias
 *    - Busca automática
 *    - Múltiplas formas de interação (clique, Enter)
 * 
 * OBSERVAÇÕES DE SEGURANÇA:
 * ========================
 * - API Key exposta no código (não recomendado para produção)
 * - Necessidade de implementar rate limiting
 * - Validação adicional de entrada do usuário pode ser necessária
 * 
 * POSSÍVEIS MELHORIAS:
 * ===================
 * 1. Mover API Key para variáveis de ambiente
 * 2. Implementar paginação
 * 3. Adicionar testes unitários
 * 4. Implementar sistema de favoritos
 * 5. Adicionar filtros avançados
 * 6. Melhorar tratamento de erros de rede
 * 7. Implementar sistema de logging
 * 8. Adicionar compressão de cache
 * 9. Implementar PWA features
 */