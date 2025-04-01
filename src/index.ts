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

const main = fetchRequest.pipe(
  Effect.filterOrFail(
    (response) => response.ok,
    () => new FetchError()
  ),
  Effect.flatMap(jsonResponse),
  // Catch multiple tags with catchTags.
  Effect.catchTags({
    FetchError: () => Effect.succeed<string>("Fetch error"),
    JsonError: () => Effect.succeed<string>("Json error"),
  })
);

Effect.runPromise(main)
  .then((json) => console.log(json))
  .catch((error) => console.error(error));
