<?php

use Laminas\Diactoros\Response\JsonResponse;
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

$app->post('/files/add', function (Request $request, Response $response, $args) use($db) {
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

    $title = $file->getClientFilename();
    // tietokantaan data TODO
    $db->prepare("INSERT INTO model (title, fileData) values (?,?)")->execute([$title, file_get_contents($newFile)]);
    return $response;
});

$app->get('/files/list', function (Request $request, Response $response) use($db) {
    $query = $db->prepare("SELECT id, title FROM model");
    $query->execute([]);
    $data = $query->fetch(PDO::FETCH_ASSOC);
    return new JsonResponse($data);
});

$app->get('/files/{id}', function (Request $request, Response $response, $args) use($db) {
    $query = $db->prepare("SELECT * FROM model WHERE id=?");
    $query->execute([$args['id']]);
    $data = $query->fetch(PDO::FETCH_ASSOC);
    return new JsonResponse(["id" => $data['id'], "title" => $data['title'], "file" => base64_encode($data['fileData'])]);
});

$app->run();