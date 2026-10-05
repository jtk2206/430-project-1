const http = require('http');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const parseBody = (request, response, handler) => {
  const body = [];

  request.on('error', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const type = request.headers['content-type'];
    if(type === 'application/x-www-form-urlencoded') {
      request.body = query.parse(bodyString);
    } else if (type === 'application/json') {
      request.body = JSON.parse(bodyString);
    } else {
      response.writeHead(400, { 'Content-Type': 'application/json' });
      response.write(JSON.stringify({ error: 'invalid data format' }));
      return response.end();
    }

    handler(request, response);
  });
};

const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addPokemon') {
    parseBody(request, response, jsonHandler.addPokemon);
  } else if (parsedUrl.pathname === '/addGeneration'){
    parseBody(request, response, jsonHandler.addGeneration);
  }
};

const handleGet = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/'){
    htmlHandler.getIndex(request,response);
  }else if (parsedUrl.pathname === '/style.css') {
    htmlHandler.getCSS(request, response);
  } else if (parsedUrl.pathname === '/getPokemonNames') {
    jsonHandler.getPokemonNames(request, response);
  } else if (parsedUrl.pathname === '/getPokemon') {
    jsonHandler.getPokemon(request, response);
  } else if (parsedUrl.pathname === '/getPokemonByName') {
    jsonHandler.getPokemonByName(request, response);
  } else if (parsedUrl.pathname === '/getAllPokemon') {
    jsonHandler.getAllPokemon(request, response);
  } else {
    jsonHandler.notFound(request, response);
  }
};

const onRequest = (request, response) => {
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);
  request.query = Object.fromEntries(parsedUrl.searchParams);

  if (request.method === 'POST') {
    handlePost(request, response, parsedUrl);
  } else {
    handleGet(request, response, parsedUrl);
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1: ${port}`);
});