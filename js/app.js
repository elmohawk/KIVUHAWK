document.addEventListener("DOMContentLoaded", async ()=>{

    await buildHeroSlider();

    renderSection(
        endpoints.trending,
        "trendingMovies"
    );

    renderSection(
        endpoints.popular,
        "popularMovies"
    );

    renderSection(
        endpoints.tv,
        "tvShows"
    );

});
