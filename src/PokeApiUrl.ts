import { Config, Context, Effect, Layer } from "effect";

/**
 * Since PokeApiUrl returns a string one can't use a Effect.Service.
 * Effect.Service requires an object to be returned
 */
export class PokeApiUrl extends Context.Tag("PokeApiUrl")<
  PokeApiUrl,
  string
>() {
  static readonly Live = Layer.effect(
    this,
    Effect.gen(function* () {
      const baseUrl = yield* Config.string("BASE_URL");
      return `${baseUrl}/api/v2/pokemon`;
    })
  );
}
