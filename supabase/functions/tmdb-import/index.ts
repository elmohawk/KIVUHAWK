import { createClient } from "npm:@supabase/supabase-js@2";

const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(
  SUPABASE_URL,
  SERVICE_ROLE_KEY
);

Deno.serve(async (req) => {
  try {
    const {
      tmdb_id,
      video_url,
      category,
      quality = "HD"
    } = await req.json();

    if (!tmdb_id) {
      return Response.json(
        {
          success: false,
          message: "Missing tmdb_id"
        },
        {
          status: 400
        }
      );
    }

    /* ======================================
       GET MOVIE DETAILS
    ====================================== */

    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdb_id}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits`
    );

    const movie = await response.json();

    if (!movie.id) {
      return Response.json(
        {
          success: false,
          message: "Movie not found"
        },
        {
          status: 404
        }
      );
    }

    /* ======================================
       TRAILER
    ====================================== */

    const trailer =
      movie.videos?.results?.find(
        (v: any) =>
          v.site === "YouTube" &&
          v.type === "Trailer"
      ) || null;

    /* ======================================
       CHECK DUPLICATE
    ====================================== */

    const { data: existing } = await supabase
      .from("movies")
      .select("id")
      .eq("tmdb_id", movie.id)
      .maybeSingle();

    const movieData = {
      title: movie.title,
      tmdb_id: movie.id,

      category,

      quality,

      video_url,

      poster_path: movie.poster_path,

      backdrop_path: movie.backdrop_path,

      poster: movie.poster_path
        ? `https://image.tmdb.org/t/p/original${movie.poster_path}`
        : null,

      backdrop: movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : null,

      overview: movie.overview,

      vote_average: movie.vote_average,

      rating: movie.vote_average,

      release_date: movie.release_date,

      year: movie.release_date
        ? Number(movie.release_date.substring(0,4))
        : null,

      runtime: movie.runtime,

      genres: movie.genres
        ?.map((g:any)=>g.name)
        .join(","),

      popularity: movie.popularity,

      original_title: movie.original_title,

      original_language: movie.original_language,

      status: movie.status,

      tagline: movie.tagline,

      trailer_key: trailer?.key || null,

      updated_at: new Date()
    };

    let result;

    if (existing) {

      result = await supabase
        .from("movies")
        .update(movieData)
        .eq("id", existing.id)
        .select()
        .single();

    } else {

      result = await supabase
        .from("movies")
        .insert(movieData)
        .select()
        .single();

    }

    return Response.json({
      success: true,
      movie: result.data
    });

  } catch (error) {

    return Response.json(
      {
        success: false,
        error: String(error)
      },
      {
        status: 500
      }
    );

  }
});
