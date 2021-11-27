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
    return;
  }

  if (searchApiRes.total_count === 0 || searchApiRes.items.length === 0) {
    Swal.fire("Opss... 😕", "Sua pesquisa não retornou nenhum resultado", "info");
    return;
  }

  /** @type {Array<any>} */
  const searchApiResItems = searchApiRes.items;
  const searchRes = {
    totalCount: searchApiRes.total_count,
    items: searchApiResItems.map(({ full_name, language, updated_at, html_url, stargazers_count }) => ({
      name: full_name,
      language,
      // updatedAt: new Date(updated_at),
      updatedAtISO: updated_at,
      url: html_url,
      stargazersCount: stargazers_count,
    })),
  };

  console.debug(searchRes);

  const searchResultsElem = document.querySelector("#search-results");
  searchResultsElem.innerHTML = "";
  for (const item of searchRes.items) {
    const resultEl = document.createElement("a");
    resultEl.target = "_blank";
    resultEl.href = item.url;
    resultEl.innerText = JSON.stringify(item);

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
