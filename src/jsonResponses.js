const fs = require('fs');
const pokedexJson = fs.readFileSync(`${__dirname}/../pokedex.json`, 'utf8');
const pokemon = JSON.parse(pokedexJson);

const respondJSON = (request, response, status, object) => {
  const content = JSON.stringify(object);
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(content, 'utf8'),
  });

  if (request.method !== 'HEAD' && status !== 204) {
    response.write(content);
  }
  
  response.end();
};

const getPokemonNames = (request, response) => {
  const responseJSON = {
    names: pokemon.map(p => p.name),
  };

  respondJSON(request, response, 200, responseJSON);
};

const getPokemon = (request, response) => {
  let returnPokemon = pokemon;

  if (request.query.name){
    returnPokemon = returnPokemon.filter(pokemon => pokemon.name === request.query.name);
  }
  if (request.query.type){
    returnPokemon = returnPokemon.filter(pokemon => pokemon.type.includes(request.query.type));
  }
  if (request.query.weaknesses){
    returnPokemon = returnPokemon.filter(pokemon => pokemon.weaknesses.includes(request.query.weaknesses));
  }

  const responseJSON = {
    returnPokemon,
  };

  respondJSON(request, response, 200, responseJSON);
};

const getPokemonByName = (request, response) => {
  let responseJSON = {
    message: 'Pokemon name is required',
  };

  let returnPokemon = pokemon;

  if (request.query.name){
    returnPokemon = returnPokemon.filter(pokemon => pokemon.name === request.query.name);
  } else{
    responseJSON.id = 'getPokemonMissingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  responseJSON = {
    returnPokemon,
  };

  respondJSON(request, response, 200, responseJSON);
};

const getAllPokemon = (request, response) => {
  const responseJSON = {
    pokemon,
  };

  respondJSON(request, response, 200, responseJSON);
};

const addPokemon = (request, response) => {
  const responseJSON = {
    message: 'Name and types are required',
  };

  const { name, types, weaknesses } = request.body;

  if (!name || !types) {
    responseJSON.id = 'addPokemonMissingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 204;

  if (!pokemon[name] && !pokemon[types]) {
    responseCode = 201;
    pokemon[name] = {
      name: name,
      types: types,
    };
  }

  if (weaknesses){
    pokemon[name].weaknesses = weaknesses;
  }

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSON(request, response, responseCode, {});
};

const addGeneration = (request, response) => {
  const responseJSON = {
    message: 'Name and generation are required',
  };

  const { name, generation } = request.body;

  if (!name || !generation) {
    responseJSON.id = 'addPokemonMissingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  if (!pokemon[name]){
    responseJSON.message = 'No pokemon with given name exists'
    responseJSON.id = 'noPokemonToEdit';
    return respondJSON(request, response, 400, responseJSON);
  }

  pokemon[name].generation = generation;
  return respondJSON(request, response, 204, {});
};

const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  respondJSON(request, response, 404, responseJSON);
};

module.exports = {
  getPokemonNames,
  getPokemon,
  getPokemonByName,
  getAllPokemon,
  addPokemon,
  addGeneration,
  notFound,
};