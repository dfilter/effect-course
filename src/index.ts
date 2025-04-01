import { Data, Effect } from "effect";

interface FetchError {
  readonly _tag: "FetchError";
}

interface JsonError {
  readonly _tag: "JsonError";
}

class FetchError extends Data.TaggedError("FetchError")<{}> {}

class JsonError extends Data.TaggedError("JsonError")<{}> {}

const fetchRequest = Effect.tryPromise({
  try: () => {
    if (Math.random() < 0.25) {
      throw new Error();
    } else {
      return fetch("https://pokeapi.co/api/v2/psadokemon/garchomp/");
    }
  },
  catch: () => new FetchError(),
});

const jsonResponse = (response: Response) =>
  Effect.tryPromise({
    try: () => {
      if (Math.random() < 0.25) {
        throw new Error();
      } else {
        return response.json();
      }
    },
    catch: () => new JsonError(),
  });

const savePokemon = (pokemon: unknown) =>
  Effect.tryPromise(
    () => new Promise((resolve) => setTimeout(() => resolve(pokemon), 500))
  );

const main = Effect.gen(function* () {
  const response = yield* fetchRequest;
  if (!response.ok) {
    return yield* new FetchError();
  }

  return yield* jsonResponse(response);
});

Effect.runPromise(main)
  .then((json) => console.log(json))
  .catch((error) => console.error(error));
