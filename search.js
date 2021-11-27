/** @type {HTMLFormElement} */
const webappHeaderFormSearchElem = document.querySelector("#webapp-header-form-search");

// Cria uma instacia do axios para usar a API do github
// CORS GitHub: https://docs.github.com/pt/rest/overview/resources-in-the-rest-api#cross-origin-resource-sharing
const axiosInstance = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    // https://docs.github.com/pt/rest/overview/resources-in-the-rest-api#current-version
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "guilhermerodrigues680",
  },
});

//
// Funções relacionadas a API do GitHub
//

async function rateLimit() {
  try {
    const apiRes = await axiosInstance.get("/rate_limit");
    console.debug(apiRes);
    console.debug(apiRes.data);
  } catch (error) {
    console.error(error);
  }
}

async function githubSearchRepositories(searchText) {
  const queryParams = {
    q: searchText,
    // sort: "stars",
    // order: "desc",
  };
  const apiRes = await axiosInstance.get("/search/repositories", { params: queryParams });
  if (apiRes.data.incomplete_results) {
    console.warn("incomplete_results", apiRes);
  }
  return apiRes.data;
}

//
// Funções relacionadas ao Web App
//

/**
 * Recebe um numero e retorna ele em um formato legivel.
 * Ex: 0 -> 0
 * Ex: 684 -> 684
 * Ex: 9125 -> 9.1k
 * @param {number} stargazersCount
 * @returns
 */
function formatStargazersCount(stargazersCount) {
  if (stargazersCount == null || stargazersCount == 0) {
    return "0";
  } else if (stargazersCount < 1000) {
    return `${stargazersCount}`;
  } else {
    return `${Math.round(stargazersCount / 100) / 10}k`;
  }
}

async function init() {
  // Mostra alerta carregando
  Swal.fire();
  Swal.showLoading();

  const pageURLSearchParams = new URLSearchParams(window.location.search);
  const searchText = pageURLSearchParams.get("q");
  console.debug("searchText:", searchText);

  // Se não for fornecido o texto da pesquisa redireciona para home
  if (!searchText) {
    window.location.href = "./index.html";
    Swal.close();
    return;
  }

  // Altera o titulo da aba
  document.title = `${searchText} - Pesquisa GitHub`;

  // Busca os dados no GitHub
  let searchApiRes;
  try {
    searchApiRes = await githubSearchRepositories(searchText);
  } catch (error) {
    console.debug(error);
    Swal.fire("Opss... 😕", "O GitHub retornou um erro inesperado", "error");
    return; // Para a execução da função
  }

  // Busca o elemento com id `search-results` e apaga tudo que tiver dentro dele
  const searchResultsElem = document.querySelector("#search-results");
  searchResultsElem.innerHTML = "";

  // Checa se a busca não retornou resultado
  if (searchApiRes.total_count === 0 || searchApiRes.items.length === 0) {
    Swal.fire("Opss... 😕", "Sua pesquisa não retornou nenhum resultado", "info");
    const noResultsEl = document.createElement("div");
    noResultsEl.classList.add("no-results");
    noResultsEl.innerText = "A pesquisa não retornou nenhum resultado.";
    searchResultsElem.appendChild(noResultsEl);
    return; // Para a execução da função
  }

  /** @type {Array<any>} */
  const searchApiResItems = searchApiRes.items;
  const searchRes = {
    totalCount: searchApiRes.total_count,
    items: searchApiResItems.map(({ full_name, language, updated_at, html_url, stargazers_count, description }) => ({
      name: full_name,
      language,
      description,
      // updatedAt: new Date(updated_at),
      updatedAtISO: updated_at,
      url: html_url,
      stargazersCount: stargazers_count,
    })),
  };

  // Para cada resultado da busca adiciona ao `searchResultsElem` na DOM
  for (const item of searchRes.items) {
    const resultEl = document.createElement("div");
    resultEl.classList.add("search-result");
    resultEl.innerHTML = `
      <a href="${item.url}" target="_blank">${item.url}</a>
      <a href="${item.url}" target="_blank">${item.name}</a>
      <div>${item.description}</div>
      <div>
        <span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 12.825L6.86667 14.7167L7.69167 11.15L4.92501 8.75L8.57501 8.44167L10 5.07501L11.425 8.44167L15.075 8.75L12.3083 11.15L13.1333 14.7167L10 12.825ZM18.3333 7.7L12.3417 7.19167L10 1.66667L7.65834 7.19167L1.66667 7.7L6.20834 11.6417L4.85001 17.5L10 14.3917L15.15 17.5L13.7833 11.6417L18.3333 7.7Z"
              fill="black"
            />
          </svg>
          <span>${formatStargazersCount(item.stargazersCount)}</span>
        </span>
        <span>${item.language != null ? item.language : ""}</span>
        <span>Atualizado ${luxon.DateTime.fromISO(item.updatedAtISO).toRelativeCalendar()}</span>
      </div>
    `;

    searchResultsElem.appendChild(resultEl);
  }

  Swal.close();
}

function handleFormSearchSubmit(event) {
  event.preventDefault();
  const searchTxt = webappHeaderFormSearchElem.elements.search.value;
  if (!searchTxt) {
    Swal.fire("Opss...", "Você precisa digitar algo na barra de pesquisa", "info");
    return;
  }
  // Limpa o campo de busca
  webappHeaderFormSearchElem.elements.search.value = "";

  // https://developer.mozilla.org/pt-BR/docs/Web/API/URLSearchParams
  // https://www.valentinog.com/blog/url/
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/URL
  // Cria uma url com quer params no modelo: `search.html?q=Projetos+Javascript`
  const searchUrl = new URL("search.html", window.location);
  searchUrl.searchParams.set("q", searchTxt);
  console.debug(searchUrl, searchUrl.href);

  // https://www.w3schools.com/howto/howto_js_redirect_webpage.asp
  // Redirecional para o url criado
  window.location.href = searchUrl.href;
}

webappHeaderFormSearchElem.addEventListener("submit", handleFormSearchSubmit);

init();
