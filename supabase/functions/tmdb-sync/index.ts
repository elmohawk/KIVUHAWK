import { createClient } from "npm:@supabase/supabase-js@2";

const TMDB_KEY = Deno.env.get("8b8937bf3e114fa3502358a4f090c0df")!;
const SUPABASE_URL = Deno.env.get("https://exjgejujfxejjlbfizgz.supabase.co")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(
    SUPABASE_URL,
    SERVICE_ROLE_KEY
);

Deno.serve(async () => {

    const { data: movies } = await supabase
        .from("movies")
        .select("id, tmdb_id")
        .not("tmdb_id", "is", null);

    for (const movie of movies ?? []) {

        const response = await fetch(
            `https://api.themoviedb.org/3/movie/${movie.tmdb_id}?api_key=${TMDB_KEY}`
        );

        const tmdb = await response.json();

        await supabase
            .from("movies")
            .update({

                title: tmdb.title,

                overview: tmdb.overview,

                poster_path: tmdb.poster_path,

                backdrop_path: tmdb.backdrop_path,

                vote_average: tmdb.vote_average,

                popularity: tmdb.popularity,

                runtime: tmdb.runtime,

                tagline: tmdb.tagline,

                status: tmdb.status,

                release_date: tmdb.release_date,

                updated_at: new Date()

            })
            .eq("id", movie.id);

    }

    return Response.json({

        success: true

    });

});
