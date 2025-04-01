import { Data, Effect } from "effect";

class FetchError extends Data.TaggedError("FetchError")<{}> {}

class JsonError extends Data.TaggedError("JsonError")<{}> {}

const fetchRequest = Effect.tryPromise({
  try: () => {
    if (Math.random() < 0.25) {
      throw new Error();
    }
    return fetch("https://pokeapi.co/api/v2/pokemon/garchomp/");
  },
  catch: () => new FetchError(),
});

const jsonResponse = (response: Response) =>
  Effect.tryPromise({
    try: () => {
      if (Math.random() < 0.25) {
        throw new Error();
      }
      return response.json();
    },
    catch: () => new JsonError(),
  });

const savePokemon = (pokemon: unknown) =>
  Effect.tryPromise(
    () => new Promise((resolve) => setTimeout(() => resolve(pokemon), 500))
  );

const program = Effect.gen(function* () {
  const response = yield* fetchRequest;
  if (!response.ok) {
    return yield* new FetchError();
  }

  return yield* jsonResponse(response);
});

const main = program.pipe(
  Effect.catchTags({
    FetchError: () => Effect.succeed("Fetch error"),
    JsonError: () => Effect.succeed("Json error"),
  })
);

Effect.runPromise(main)
  .then((json) => console.log(json))
  .catch((error) => console.error(error));
