import { Context, Effect, Layer, Schema } from "effect";
import { FetchError, JsonError } from "./errors";
import { Pokemon } from "./schemas";
import { PokemonCollection } from "./PokemonCollection";
import { BuildPokeApiUrl } from "./BuildPokeApiUrl";

const make = Effect.gen(function* () {
  /// 1️⃣ Extract `PokemonCollection` and `BuildPokeApiUrl` outside of `getPokemon`
  const pokemonCollection = yield* PokemonCollection;
  const buildPokeApiUrl = yield* BuildPokeApiUrl;

  return {
    getPokemon: Effect.gen(function* () {
      const requestUrl = buildPokeApiUrl({ name: pokemonCollection[0] });

      const response = yield* Effect.tryPromise({
        try: () => fetch(requestUrl),
        catch: () => new FetchError(),
      });

      if (!response.ok) {
        return yield* new FetchError();
      }

      const json = yield* Effect.tryPromise({
        try: () => response.json(),
        catch: () => new JsonError(),
      });

      return yield* Schema.decodeUnknown(Pokemon)(json);
    }),
  };
});

const test = {
  getPokemon: Effect.succeed(
    new Pokemon({ id: 1, order: 1, name: "myname", height: 10, weight: 10 })
  ),
};

export class PokeApi extends Context.Tag("PokeApi")<
  PokeApi,
  /// 2️⃣ Change the definition of the service to `Effect.Effect.Success<typeof make>`
  Effect.Effect.Success<typeof make>
>() {
  /// 3️⃣ Use `Layer.effect` instead of `Layer.succeed`
  static readonly Live = Layer.effect(this, make).pipe(
    Layer.provide(Layer.mergeAll(PokemonCollection.Live, BuildPokeApiUrl.Live))
  );

  static readonly Test = Layer.succeed(this, test);
}
