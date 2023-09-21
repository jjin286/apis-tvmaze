"use strict";

const $showsList = $("#showsList");
const $revealEpsBtn = $(".Show-getEpisodes");
const $episodesList = $("#episodesList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const BASE_URL = 'http://api.tvmaze.com/';

console.log($revealEpsBtn);
/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {

  const params = new URLSearchParams({ q: term });
  const response = await fetch(`${BASE_URL}search/shows?${params}`);
  const data = await response.json();

  const showsInfo = await data.map(function (show) {
    let defaultImage = (show.show.image?.medium || `https://store-images.s-microsoft.com/image/apps.65316.13510798887490672.6e1ebb25-96c8-4504-b714-1f7cbca3c5ad.f9514a23-1eb8-4916-a18e-99b1a9817d15?mode=scale&q=90&h=300&w=300`);

    return {
      id: show.show.id,
      name: show.show.name,
      summary: show.show.summary,
      image: defaultImage,
    };
  });

  return showsInfo;
  // REFERENCE RETURN
  // return [
  //   {
  //     id: 1767,
  //     name: "The Bletchley Circle",
  //     summary:
  //       `<p><b>The Bletchley Circle</b> follows the journey of four ordinary
  //          women with extraordinary skills that helped to end World War II.</p>
  //        <p>Set in 1952, Susan, Millie, Lucy and Jean have returned to their
  //          normal lives, modestly setting aside the part they played in
  //          producing crucial intelligence, which helped the Allies to victory
  //          and shortened the war. When Susan discovers a hidden code behind an
  //          unsolved murder she is met by skepticism from the police. She
  //          quickly realises she can only begin to crack the murders and bring
  //          the culprit to justice with her former friends.</p>`,
  //     image:
  //         "http://static.tvmaze.com/uploads/images/medium_portrait/147/369403.jpg"
  //   }
  // ]
}


/** Given list of shows, create markup for each and append to DOM.
 *
 * A show is {id, name, summary, image}
 * */

function displayShows(shows) {
  $showsList.empty();

  for (const show of shows) {
    const $show = $(`
        <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchShowsAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  displayShows(shows);
}

$searchForm.on("submit", async function handleSearchForm(evt) {
  evt.preventDefault();
  await searchShowsAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const response = await fetch(`${BASE_URL}shows/${id}/episodes`);
  const data = await response.json();

  const episodesList = await data.map(function (episode) {

    return {
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number,
    };
  });

  return episodesList;
}

/**
 * Given list of episodes, create markup for each and append to DOM.
 *
 * An episode is {id, name, season, number}
 */

function displayEpisodes(episodes) {

  for (const episode of episodes) {
    const $episode = $(`
        <li>${episode.name} (season ${episode.season}, number ${episode.number})</li>
      `);

    $episodesList.append($episode);
  }
}

/** Handle episodes list button: get episodes from API and display.
 *    Show episodes area (that only gets shown if they ask for episodes)
 */
async function getEpisodesAndDisplay(evt) {
  $episodesList.empty();

  let $parentElement = $(evt.target).closest('.Show');
  let showId = $parentElement.data('show-id');

  const episodesList = await getEpisodesOfShow(showId);
  displayEpisodes(episodesList);

  $episodesArea.show();
}


$showsList.on("click", '.Show-getEpisodes', async function (evt) {
  await getEpisodesAndDisplay(evt);
});