import { createClient } from "npm:@supabase/supabase-js@2";

const TMDB_KEY =
Deno.env.get("TMDB_API_KEY")!;

const SUPABASE_URL =
Deno.env.get("SUPABASE_URL")!;

const SERVICE_ROLE_KEY =
Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(
    SUPABASE_URL,
    SERVICE_ROLE_KEY
);

Deno.serve(async(req)=>{

try{

const {

tmdb_id,

category,

quality,

video_url,

download_url,

translator

}

=

await req.json();

if(!tmdb_id){

return Response.json({

success:false,

message:"Missing tmdb_id"

},

{status:400}

);

}
  const response =

await fetch(

`https://api.themoviedb.org/3/movie/${tmdb_id}?api_key=${TMDB_KEY}&append_to_response=videos,credits,images,recommendations,similar`

);

const movie =

await response.json();

if(!movie.id){

return Response.json({

success:false,

message:"Movie not found"

},

{status:404}

);

}
  const trailer =

movie.videos.results.find(

v=>

v.site==="YouTube"

&&

v.type==="Trailer"

);
  const poster =

movie.poster_path

?

`https://image.tmdb.org/t/p/original${movie.poster_path}`

:

null;

const backdrop =

movie.backdrop_path

?

`https://image.tmdb.org/t/p/original${movie.backdrop_path}`

:

null;
  const movieData={

title:movie.title,

tmdb_id:movie.id,

category,

quality,

translator,

video_url,

download_url,

poster,

backdrop,

poster_path:movie.poster_path,

backdrop_path:movie.backdrop_path,

overview:movie.overview,

rating:movie.vote_average,

vote_average:movie.vote_average,

runtime:movie.runtime,

genres:

movie.genres

.map(g=>g.name)

.join(","),

release_date:

movie.release_date,

year:

movie.release_date

?

Number(

movie.release_date.substring(0,4)

)

:

null,

popularity:

movie.popularity,

adult:

movie.adult,

original_title:

movie.original_title,

original_language:

movie.original_language,

status:

movie.status,

tagline:

movie.tagline,

country:

movie.production_countries

?.map(c=>c.name)

.join(","),

language:

movie.spoken_languages

?.map(l=>l.english_name)

.join(","),

trailer_key:

trailer?.key ||

null,

thumbnail:

poster,

updated_at:

new Date()

};
  const {

data:existing

}

=

await supabase

.from("movies")

.select("id")

.eq(

"tmdb_id",

movie.id

)

.maybeSingle();
  let result;

if(existing){

result=

await supabase

.from("movies")

.update(movieData)

.eq(

"id",

existing.id

)

.select()

.single();

}

else{

result=

await supabase

.from("movies")

.insert(movieData)

.select()

.single();

}
  return Response.json({

success:true,

movie:result.data

});

}

catch(error){

return Response.json({

success:false,

error:String(error)

},

{

status:500

}

);

}

});
