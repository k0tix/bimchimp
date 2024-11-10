<?php

use Laminas\Diactoros\Response\JsonResponse;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../cache.php';
$db = new PDO('sqlite:../../db/db.sqlite');

// Instantiate App
$app = AppFactory::create();

// Add error middleware
$app->addErrorMiddleware(true, true, true);

// Add routes

$app->post('/files/add', function (Request $request, Response $response, $args) use($db) {
    $data = json_decode($request->getBody()->getContents(), true);
    $title = $data['title'];
    
    $b64 = $data['file'];

    $prefix = 'data:application/octet-stream;base64,';
    if (substr($b64, 0, strlen($prefix)) == $prefix) {
        $b64 = substr($b64, strlen($prefix));
    } 
    $cacheRes = Cache::getCachedIfc($b64);



    // datapoikien koodi TODO
    if($cacheRes) {
        $b64 = $cacheRes;
    } else {
       //$b64 = ""
    }
    // muunto ifc-> weetabix
    $cacheBim = Cache::getCachedBimConv($b64);

    $newFile = tempnam(__DIR__ . '/../tmp', 'ifc');
    $oldFile = $newFile . ".ifc";
    file_put_contents($oldFile, base64_decode($b64));
    exec(__DIR__ . "/../WexBIM/win-x64/CreateWexBIM.exe $oldFile $newFile");


    $endData = file_get_contents($newFile);
    if(empty($endData)){
        return new JsonResponse(["error" => "Conversion failed"], 400, ["Access-Control-Allow-Origin" => "*"]);
    }
    $db->prepare("INSERT INTO model (title, fileData) values (?,?)")->execute([$title, $endData]);
    return new JsonResponse(["id" => $db->lastInsertId()],200, ["Access-Control-Allow-Origin" => "*"]);
});

$app->get('/files/list', function (Request $request, Response $response) use($db) {
    $query = $db->prepare("SELECT id, title FROM model");
    $query->execute([]);
    $data = $query->fetchAll(PDO::FETCH_ASSOC);

    return new JsonResponse($data, 200, ["Access-Control-Allow-Origin" => "*"]);
});

$app->get('/files/{id}', function (Request $request, Response $response, $args) use($db) {
    $query = $db->prepare("SELECT * FROM model WHERE id=?");
    $query->execute([$args['id']]);
    $data = $query->fetch(PDO::FETCH_ASSOC);
    return new JsonResponse(["id" => $data['id'], "title" => $data['title'], "file" => base64_encode($data['fileData'])], 200, ["Access-Control-Allow-Origin" => "*"]);
});

$app->get('/files/{id}/products', function (Request $request, Response $response, $args) use($db) {
    $query = $db->prepare("SELECT id, product_id FROM metadata WHERE id=?");
    $query->execute([$args['id']]);
    $data = $query->fetchAll(PDO::FETCH_ASSOC);
    return new JsonResponse($data, 200, ["Access-Control-Allow-Origin" => "*"]);
});

$app->post('/files/{model_id}/products', function (Request $request, Response $response, $args) use($db) {
    $data = json_decode($request->getBody()->getContents(), true);
    $db->prepare("UPDATE metadata SET product_id=? WHERE id=? AND model_id=?")->execute([$data["product_id"], $data['id'], $args['model_id']]);
    return new JsonResponse(["id" => $data['id']], 200, ["Access-Control-Allow-Origin" => "*"]);
});
$app->get('/products', function (Request $request, Response $response, $args) {
    $search = isset($request->getQueryParams()['search']) ? $request->getQueryParams()['search'] : "";
    $data = json_decode(file_get_contents(__DIR__ ."/../transformed_peikko_products.json"), true);


    $parsedData = filterData($data);
    if($search != ""){
        $parsedData = array_filter($parsedData, function($item) use($search){
            return strpos($item["product_id"], $search) !== false;
        });
    }
    return new JsonResponse($parsedData, 200, ["Access-Control-Allow-Origin" => "*"]);
});
function filterData($data) {
    $parsedData = [];
    foreach ($data as $key => $value) {
        if(is_array($value)){
            if(in_array("items", array_keys($value))){
                foreach ($value["items"] as $key1 => $value1) {
                    $parsedData[] = ["product_id" => $value1, "img" => $value["img"]];
                }
            } else {
                $parsedData = array_merge($parsedData, filterData($value));
            }
            
        }
    }
    return $parsedData;
};

$app->run();