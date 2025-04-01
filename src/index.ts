import { Effect, pipe } from "effect";

const fetchRequest = Effect.tryPromise(() =>
  fetch("https://pokeapi.co/api/v2/pokemon/garchomp/")
);

const jsonResponse = (response: Response) =>
  Effect.tryPromise(() => response.json());

const savePokemon = (pokemon: unknown) =>
  Effect.tryPromise(
    () => new Promise((resolve) => setTimeout(() => resolve(pokemon), 500))
  );

/*
const main = pipe(
  fetchRequest,
  Effect.flatMap(jsonResponse), // <- pipe allows flatmap to pass the result of the previous effect into the next.
  Effect.flatMap(savePokemon)
);

// A more verbose version of the above would be the following:
const main = pipe(
  fetchRequest,
  (fetchRequestEffect) => Effect.flatMap(fetchRequestEffect, jsonResponse),
  (jsonResponseEffect) => Effect.flatMap(jsonResponseEffect, savePokemon)
);

// You can also compose the above (without savePokemon) like so:
const main = fetchRequest.pipe(
  (fetchRequestEffect) => Effect.flatMap(jsonResponse)(fetchRequestEffect)
);
*/

// Every effect has its own pipe function so we can also do something like this:
const main = fetchRequest.pipe(
  Effect.flatMap(jsonResponse),
  Effect.flatMap(savePokemon)
);

Effect.runPromise(main).then((json) => console.log(json));
