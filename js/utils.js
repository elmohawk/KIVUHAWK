/* ==========================================
   KIVUSTREAM IMAGE UTILITIES
========================================== */

function getPoster(item){

    if(!item) return "assets/logo.png";

    if(item.poster){
        return item.poster;
    }

    if(item.poster_url){
        return item.poster_url;
    }

    if(item.poster_path){
        return `https://image.tmdb.org/t/p/w500${item.poster_path}`;
    }

    if(item.backdrop){
        return item.backdrop;
    }

    if(item.backdrop_url){
        return item.backdrop_url;
    }

    if(item.backdrop_path){
        return `https://image.tmdb.org/t/p/w780${item.backdrop_path}`;
    }

    return "assets/logo.png";
}
