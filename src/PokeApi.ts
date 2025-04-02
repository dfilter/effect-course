import { Effect, Context, type ParseResult, Config, Schema } from "effect";
import type { ConfigError } from "effect/ConfigError";
import { FetchError, JsonError } from "./errors";
import { Pokemon } from "./schemas";

export interface PokeApi {
  readonly getPokemon: Effect.Effect<
    Pokemon,
    FetchError | JsonError | ParseResult.ParseError | ConfigError
  >;
}

export const PokeApi = Context.GenericTag<PokeApi>("PokeApi");

// 👉 `PokeApi.of` defines a concrete implementation for the service
export const PokeApiLive = PokeApi.of({
  getPokemon: Effect.gen(function* () {
    const baseUrl = yield* Config.string("BASE_URL");

    const response = yield* Effect.tryPromise({
      try: () => fetch(`${baseUrl}/api/v2/pokemon/garchomp/`),
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
});

export const PokeApiTest = PokeApi.of({
  getPokemon: Effect.succeed({
    id: 1,
    height: 10,
    weight: 10,
    order: 1,
    name: "myname",
  }),
});
