import { Effect, pipe } from "effect";

const fetchRequest = Effect.tryPromise(() =>
  fetch("https://pokeapi.co/api/v2/pokemon/garchomp/")
);

const jsonResponse = (response: Response) =>
  Effect.tryPromise(() => {
    if (Math.random() < 0.5) {
      throw new Error();
    } else {
      return response.json();
    }
  });

const savePokemon = (pokemon: unknown) =>
  Effect.tryPromise(
    () => new Promise((resolve) => setTimeout(() => resolve(pokemon), 500))
  );

const main = fetchRequest.pipe(
  Effect.flatMap(jsonResponse),
  // Allows catching of a SINGLE error
  Effect.catchTag("UnknownException", () =>
    Effect.succeed<string>("There was an error")
  )
);

Effect.runPromise(main)
  .then((json) => console.log(json))
  .catch((thing) => console.log(thing));
