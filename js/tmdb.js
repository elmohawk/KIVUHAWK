/* ==========================================================
   KIVUSTREAM TMDB ENGINE
   PART 1
   Core + Cache + Fetch
========================================================== */

"use strict";

/* ==========================================================
   CONFIG
========================================================== */

const TMDB = {};

TMDB.API_KEY = TMDB_API_KEY;
TMDB.BASE = TMDB_BASE;

TMDB.IMAGE = {

    poster: "https://image.tmdb.org/t/p/w500",

    backdrop: "https://image.tmdb.org/t/p/original",

    profile: "https://image.tmdb.org/t/p/w300",

    original: "https://image.tmdb.org/t/p/original"

};

TMDB.DEFAULT_POSTER = "assets/logo.png";

/* ==========================================================
   MEMORY CACHE
========================================================== */

TMDB.cache = new Map();

TMDB.pending = new Map();

TMDB.cacheHours = 24;

/* ==========================================================
   LOCAL STORAGE
========================================================== */

TMDB.readCache = function(key){

    try{

        const item = localStorage.getItem(key);

        if(!item) return null;

        const parsed = JSON.parse(item);

        const expired =

            Date.now() >

            parsed.expire;

        if(expired){

            localStorage.removeItem(key);

            return null;

        }

        return parsed.data;

    }

    catch{

        return null;

    }

};

TMDB.writeCache = function(key,data){

    try{

        localStorage.setItem(

            key,

            JSON.stringify({

                expire:

                    Date.now()

                    +

                    TMDB.cacheHours

                    *

                    60

                    *

                    60

                    *

                    1000,

                data

            })

        );

    }

    catch(e){

        console.warn(e);

    }

};

/* ==========================================================
   IMAGE HELPERS
========================================================== */

TMDB.poster=function(path){

    if(!path)

        return TMDB.DEFAULT_POSTER;

    return TMDB.IMAGE.poster+path;

};

TMDB.backdrop=function(path){

    if(!path)

        return TMDB.DEFAULT_POSTER;

    return TMDB.IMAGE.backdrop+path;

};

TMDB.profile=function(path){

    if(!path)

        return TMDB.DEFAULT_POSTER;

    return TMDB.IMAGE.profile+path;

};

TMDB.original=function(path){

    if(!path)

        return TMDB.DEFAULT_POSTER;

    return TMDB.IMAGE.original+path;

};

/* ==========================================================
   CONTENT TYPE
========================================================== */

TMDB.endpoint=function(type){

    return

    type==="series"

    ||

    type==="tv"

    ?

    "tv"

    :

    "movie";

};

/* ==========================================================
   GENERIC REQUEST
========================================================== */

TMDB.request=async function(url){

    /* Memory cache */

    if(TMDB.cache.has(url))

        return TMDB.cache.get(url);

    /* LocalStorage */

    const local=

    TMDB.readCache(url);

    if(local){

        TMDB.cache.set(

            url,

            local

        );

        return local;

    }

    /* Duplicate request */

    if(TMDB.pending.has(url))

        return TMDB.pending.get(url);

    const promise=(async()=>{

        try{

            const response=

            await fetch(url);

            if(!response.ok){

                throw new Error(

                    `TMDB ${response.status}`

                );

            }

            const data=

            await response.json();

            TMDB.cache.set(

                url,

                data

            );

            TMDB.writeCache(

                url,

                data

            );

            return data;

        }

        catch(error){

            console.error(

                "TMDB ERROR",

                error

            );

            return null;

        }

        finally{

            TMDB.pending.delete(url);

        }

    })();

    TMDB.pending.set(

        url,

        promise

    );

    return promise;

};

/* ==========================================================
   BUILD URL
========================================================== */

TMDB.url=function(path){

    return

    `${TMDB.BASE}${path}?api_key=${TMDB.API_KEY}`;

};

TMDB.urlWithPage=function(path,page=1){

    return

    `${TMDB.BASE}${path}?api_key=${TMDB.API_KEY}&page=${page}`;

};

/* ==========================================================
   TEST
========================================================== */

TMDB.test=async function(){

    const data=

    await TMDB.request(

        TMDB.url("/movie/550")

    );

    console.log(

        "TMDB ENGINE READY",

        data

    );

};
/* ==========================================================
   KIVUSTREAM TMDB ENGINE
   PART 2
   DETAILS + SEARCH + LISTS
========================================================== */

/* ==========================================================
   DETAILS
========================================================== */

TMDB.details = async function(id, type = "movie") {

    if (!id) return null;

    const endpoint = TMDB.endpoint(type);

    const url =
        `${TMDB.BASE}/${endpoint}/${id}?api_key=${TMDB.API_KEY}`;

    return await TMDB.request(url);

};

/* ==========================================================
   TRENDING
========================================================== */

TMDB.trending = async function(media = "movie", period = "week", page = 1) {

    const url =
        `${TMDB.BASE}/trending/${media}/${period}?api_key=${TMDB.API_KEY}&page=${page}`;

    const data = await TMDB.request(url);

    return data?.results || [];

};

/* ==========================================================
   POPULAR MOVIES
========================================================== */

TMDB.popularMovies = async function(page = 1) {

    const url =
        `${TMDB.BASE}/movie/popular?api_key=${TMDB.API_KEY}&page=${page}`;

    const data = await TMDB.request(url);

    return data?.results || [];

};

/* ==========================================================
   POPULAR TV
========================================================== */

TMDB.popularSeries = async function(page = 1) {

    const url =
        `${TMDB.BASE}/tv/popular?api_key=${TMDB.API_KEY}&page=${page}`;

    const data = await TMDB.request(url);

    return data?.results || [];

};

/* ==========================================================
   NOW PLAYING
========================================================== */

TMDB.nowPlaying = async function(page = 1) {

    const url =
        `${TMDB.BASE}/movie/now_playing?api_key=${TMDB.API_KEY}&page=${page}`;

    const data = await TMDB.request(url);

    return data?.results || [];

};

/* ==========================================================
   UPCOMING
========================================================== */

TMDB.upcoming = async function(page = 1) {

    const url =
        `${TMDB.BASE}/movie/upcoming?api_key=${TMDB.API_KEY}&page=${page}`;

    const data = await TMDB.request(url);

    return data?.results || [];

};

/* ==========================================================
   TOP RATED MOVIES
========================================================== */

TMDB.topRatedMovies = async function(page = 1) {

    const url =
        `${TMDB.BASE}/movie/top_rated?api_key=${TMDB.API_KEY}&page=${page}`;

    const data = await TMDB.request(url);

    return data?.results || [];

};

/* ==========================================================
   TOP RATED TV
========================================================== */

TMDB.topRatedSeries = async function(page = 1) {

    const url =
        `${TMDB.BASE}/tv/top_rated?api_key=${TMDB.API_KEY}&page=${page}`;

    const data = await TMDB.request(url);

    return data?.results || [];

};

/* ==========================================================
   SEARCH MOVIES
========================================================== */

TMDB.searchMovies = async function(query, page = 1) {

    if (!query) return [];

    const url =
        `${TMDB.BASE}/search/movie?api_key=${TMDB.API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;

    const data = await TMDB.request(url);

    return data?.results || [];

};

/* ==========================================================
   SEARCH TV
========================================================== */

TMDB.searchSeries = async function(query, page = 1) {

    if (!query) return [];

    const url =
        `${TMDB.BASE}/search/tv?api_key=${TMDB.API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;

    const data = await TMDB.request(url);

    return data?.results || [];

};

/* ==========================================================
   MULTI SEARCH
========================================================== */

TMDB.search = async function(query, page = 1) {

    if (!query) return [];

    const url =
        `${TMDB.BASE}/search/multi?api_key=${TMDB.API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;

    const data = await TMDB.request(url);

    return (data?.results || []).filter(item =>
        item.media_type === "movie" ||
        item.media_type === "tv"
    );

};

/* ==========================================================
   DISCOVER MOVIES
========================================================== */

TMDB.discoverMovies = async function(page = 1) {

    const url =
        `${TMDB.BASE}/discover/movie?sort_by=popularity.desc&api_key=${TMDB.API_KEY}&page=${page}`;

    const data = await TMDB.request(url);

    return data?.results || [];

};

/* ==========================================================
   DISCOVER SERIES
========================================================== */

TMDB.discoverSeries = async function(page = 1) {

    const url =
        `${TMDB.BASE}/discover/tv?sort_by=popularity.desc&api_key=${TMDB.API_KEY}&page=${page}`;

    const data = await TMDB.request(url);

    return data?.results || [];

};

/* ==========================================================
   GET TITLE
========================================================== */

TMDB.title = function(item) {

    return item.title || item.name || "Untitled";

};

/* ==========================================================
   GET YEAR
========================================================== */

TMDB.year = function(item) {

    const date =
        item.release_date ||
        item.first_air_date ||
        "";

    return date ? date.substring(0, 4) : "";

};

/* ==========================================================
   GET RATING
========================================================== */

TMDB.rating = function(item) {

    return item.vote_average
        ? Number(item.vote_average).toFixed(1)
        : "N/A";

};
/* ==========================================================
   KIVUSTREAM TMDB ENGINE
   PART 3
   CAST + VIDEOS + IMAGES + RECOMMENDATIONS
========================================================== */


/* ==========================================================
   CREDITS (CAST + CREW)
========================================================== */

TMDB.credits = async function(id, type="movie"){

    if(!id) return null;


    const endpoint =
        TMDB.endpoint(type);


    const url =
    `${TMDB.BASE}/${endpoint}/${id}/credits?api_key=${TMDB.API_KEY}`;


    return await TMDB.request(url);

};



/* ==========================================================
   CAST ONLY
========================================================== */

TMDB.cast = async function(id,type="movie"){


    const data =
    await TMDB.credits(id,type);


    return data?.cast || [];

};



/* ==========================================================
   CREW ONLY
========================================================== */

TMDB.crew = async function(id,type="movie"){


    const data =
    await TMDB.credits(id,type);


    return data?.crew || [];

};



/* ==========================================================
   DIRECTOR
========================================================== */

TMDB.director = async function(id,type="movie"){


    const crew =
    await TMDB.crew(id,type);


    return crew.find(person=>

        person.job==="Director"

    ) || null;


};



/* ==========================================================
   VIDEOS
========================================================== */

TMDB.videos = async function(id,type="movie"){


    const endpoint =
    TMDB.endpoint(type);


    const url =
    `${TMDB.BASE}/${endpoint}/${id}/videos?api_key=${TMDB.API_KEY}`;


    const data =
    await TMDB.request(url);


    return data?.results || [];


};



/* ==========================================================
   BEST TRAILER
========================================================== */

TMDB.trailer = async function(id,type="movie"){


    const videos =
    await TMDB.videos(id,type);


    if(!videos.length)

        return null;



    const trailer = videos.find(video=>

        video.type==="Trailer" &&

        video.site==="YouTube"

    );


    if(trailer)

        return trailer;



    const teaser = videos.find(video=>

        video.type==="Teaser" &&

        video.site==="YouTube"

    );


    return teaser || null;


};




/* ==========================================================
   TRAILER URL
========================================================== */

TMDB.trailerURL = function(video){


    if(!video?.key)

        return null;


    return

    `https://www.youtube.com/embed/${video.key}`;


};




/* ==========================================================
   IMAGES
========================================================== */

TMDB.images = async function(id,type="movie"){


    const endpoint =
    TMDB.endpoint(type);



    const url =
    `${TMDB.BASE}/${endpoint}/${id}/images?api_key=${TMDB.API_KEY}`;



    return await TMDB.request(url);


};




/* ==========================================================
   LOGO
========================================================== */

TMDB.logo = async function(id,type="movie"){


    const data =
    await TMDB.images(id,type);



    const logo =
    data?.logos?.find(item=>

        item.iso_639_1==="en"

    )

    ||

    data?.logos?.[0];



    return logo ?

    TMDB.original(logo.file_path)

    :

    null;


};




/* ==========================================================
   RECOMMENDATIONS
========================================================== */

TMDB.recommendations = async function(id,type="movie"){


    const endpoint =
    TMDB.endpoint(type);



    const url =
    `${TMDB.BASE}/${endpoint}/${id}/recommendations?api_key=${TMDB.API_KEY}`;



    const data =
    await TMDB.request(url);



    return data?.results || [];


};




/* ==========================================================
   SIMILAR CONTENT
========================================================== */

TMDB.similar = async function(id,type="movie"){


    const endpoint =
    TMDB.endpoint(type);



    const url =
    `${TMDB.BASE}/${endpoint}/${id}/similar?api_key=${TMDB.API_KEY}`;



    const data =
    await TMDB.request(url);



    return data?.results || [];


};




/* ==========================================================
   GENRES
========================================================== */

TMDB.genres = function(item){


    if(!item?.genres)

        return [];


    return item.genres.map(g=>g.name);


};




/* ==========================================================
   COUNTRIES
========================================================== */

TMDB.countries=function(item){


    return (

        item?.production_countries

        ||

        []

    ).map(country=>

        country.name

    );


};




/* ==========================================================
   LANGUAGES
========================================================== */

TMDB.languages=function(item){


    return (

        item?.spoken_languages

        ||

        []

    ).map(lang=>

        lang.english_name

    );


};




/* ==========================================================
   TV SEASONS INFO
   (Metadata Only)
========================================================== */

TMDB.seasons = async function(id,season,type="series"){


    if(type!=="series")

        return null;



    const url =

    `${TMDB.BASE}/tv/${id}/season/${season}?api_key=${TMDB.API_KEY}`;



    return await TMDB.request(url);


};




/* ==========================================================
   FORMAT CONTENT
========================================================== */

TMDB.format = function(item){


    return {


        id:item.id,


        title:
        item.title || item.name,


        poster:
        TMDB.poster(item.poster_path),


        backdrop:
        TMDB.backdrop(item.backdrop_path),


        overview:
        item.overview || "",


        rating:
        TMDB.rating(item),


        year:
        TMDB.year(item),


        genres:
        TMDB.genres(item)


    };


};
