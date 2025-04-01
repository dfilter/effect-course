import { Effect, pipe } from "effect";

interface FetchError extends Error {
  readonly _tag: "FetchError";
}

interface JSONParseError extends Error {
  readonly _tag: "JSONParseError";
}

const fetchRequest = Effect.tryPromise({
  try: () => {
    if (Math.random() < 0.25) {
      throw new Error();
    } else {
      return fetch("https://pokeapi.co/api/v2/psadokemon/garchomp/");
    }
  },
  catch: (): FetchError => ({
    _tag: "FetchError",
    name: "FetchError",
    message: "An error occurred while fetching Pokemon.",
  }),
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
    catch: (): JSONParseError => ({
      _tag: "JSONParseError",
      name: "JSONParseError",
      message: "An error occurred while parsing the pokemon response.",
    }),
  });

const savePokemon = (pokemon: unknown) =>
  Effect.tryPromise(
    () => new Promise((resolve) => setTimeout(() => resolve(pokemon), 500))
  );

const main = fetchRequest.pipe(
  Effect.flatMap(jsonResponse),
  // Catch multiple tags with catchTags.
  Effect.catchTags({
    FetchError: (error) => Effect.succeed<string>(error.message),
    JSONParseError: (error) => Effect.succeed<string>(error.message),
  })
);

Effect.runPromise(main)
  .then((json) => console.log(json))
  .catch((error) => console.error(error));
