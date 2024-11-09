<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';
$db = new PDO('sqlite:../../db/db.sqlite');

// Instantiate App
$app = AppFactory::create();

// Add error middleware
$app->addErrorMiddleware(true, true, true);

// Add routes
$app->get('/', function (Request $request, Response $response) {
    $response->getBody()->write(<<<HTML
        <form action="/files/add" method="post" enctype="multipart/form-data">
            <input type="file" name="file" accept=".ifc">
            <button type="submit">Send</button>
        </form>
    HTML);

    return $response;
});

$app->post('/files/add', function (Request $request, Response $response, $args) {
    // datapoikien koodi TODO




    // muunto ifc-> weetabix
    $newFile = tempnam(__DIR__ . '/../tmp', 'ifc');
    $oldFile = $newFile . ".ifc";
    /** @var UploadedFile $file */
    $file = $request->getUploadedFiles()["file"];
    $file->moveTo($oldFile);

    $out = "";
    $cmd = __DIR__ . "/../WexBIM/win-x64/CreateWexBIM.exe $oldFile $newFile";
    exec($cmd, $out);


    // tietokantaan data TODO

    return $response;
});

$app->get('/files/list', function (Request $request, Response $response) {
    return $response;
});

$app->get('/files/{id}', function (Request $request, Response $response, $args) {
    $id = $args['id'];

    return $response;
});

$app->run();