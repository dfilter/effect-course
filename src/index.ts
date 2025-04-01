import { Effect, pipe } from "effect";

interface FetchError {
  readonly _tag: "FetchError";
}

interface JSONParseError {
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
  catch: (): FetchError => ({ _tag: "FetchError" }),
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
    catch: (): JSONParseError => ({ _tag: "JSONParseError" }),
  });

const savePokemon = (pokemon: unknown) =>
  Effect.tryPromise(
    () => new Promise((resolve) => setTimeout(() => resolve(pokemon), 500))
  );

const main = fetchRequest.pipe(
  Effect.flatMap(jsonResponse),
  // Catch multiple tags with catchTags.
  Effect.catchTags({
    FetchError: () =>
      Effect.succeed<string>("There was ane error fetching data."),
    JSONParseError: () => Effect.succeed<string>("There was a parsing error."),
  })
);

Effect.runPromise(main)
  .then((json) => console.log(json))
  .catch((error) => console.error(error));
