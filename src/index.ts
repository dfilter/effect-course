import { Effect } from "effect";
import { PokeApi } from "./PokeApi";
import { PokemonCollection } from "./PokemonCollection";
import { BuildPokeApiUrl } from "./BuildPokeApiUrl";
import { PokeApiUrl } from "./PokeApiUrl";

const program = Effect.gen(function* () {
  const pokeApi = yield* PokeApi;
  return yield* pokeApi.getPokemon;
});

const runnable = program.pipe(
  Effect.provideService(PokeApi, PokeApi.Live),
  Effect.provideService(PokemonCollection, PokemonCollection.Live),
  Effect.provideServiceEffect(BuildPokeApiUrl, BuildPokeApiUrl.Live),
  Effect.provideServiceEffect(PokeApiUrl, PokeApiUrl.Live)
);

const main = runnable.pipe(
  Effect.catchTags({
    FetchError: () => Effect.succeed("Fetch error"),
    JsonError: () => Effect.succeed("Json error"),
    ParseError: () => Effect.succeed("Parse error"),
  })
);

Effect.runPromise(main).then(console.log);
