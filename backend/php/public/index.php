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

    $ch = curl_init();
    # Setup request to send json via POST.
    $payload = json_encode( [ "file"=> $b64 ] );
    curl_setopt($ch, CURLOPT_POST, 1); 
    curl_setopt( $ch, CURLOPT_POSTFIELDS, $payload );
    curl_setopt( $ch, CURLOPT_HTTPHEADER, ['Content-Type:application/json']);
    # Return response instead of printing.
    curl_setopt($ch, CURLOPT_URL,"http://10.0.0.5:5000/beamer" );
    curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
    # Send request.
    $result = curl_exec($ch);
    curl_close ($ch); 
    $processedData = json_decode($result, true);

    $b64 = $processedData["file"] ?? $b64;
    $metadata = $processedData["metadata"] ?? [];

    if(empty($b64)){
        return new JsonResponse(["error" => "Conversion failed (data tiimin vika)"], 400, ["Access-Control-Allow-Origin" => "*"]);
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
    $modelId = $db->lastInsertId();
    foreach ($metadata as $key => $value) {
        $prod = null;
        if($key%2==0) $prod = "HPM_16L";
        $db->prepare("INSERT INTO metadata (element_id, product_id, model_id, clash_type) values (?,?,?,?)")->execute([$value["marker_id"], $prod, $modelId, $value["clash_type"]]);
    }
    return new JsonResponse(["id" => $modelId],200, ["Access-Control-Allow-Origin" => "*"]);
});

$app->get('/files/list', function (Request $request, Response $response) use($db) {
    $query = $db->prepare("SELECT id, title FROM model");
    $query->execute([]);
    $data = $query->fetchAll(PDO::FETCH_ASSOC);
    $readyData = [];
    foreach($data as $dat) {
        
        $query = $db->prepare("SELECT product_id as label, count(*) as amount FROM metadata WHERE model_id=? GROUP BY product_id");
        $query->execute([$dat['id']]);
        $product_counts = $query->fetchAll(PDO::FETCH_ASSOC);   
    
    
        $query = $db->prepare("SELECT clash_type as label, count(*) as amount FROM metadata WHERE model_id=? GROUP BY clash_type");
        $query->execute([$dat['id']]);
        $clash_type_counts = $query->fetchAll(PDO::FETCH_ASSOC);
        $readyData[] = ["id" => $dat['id'], "title" => $dat['title'], "stats" => ["products" => $product_counts, "clash_types" => $clash_type_counts]];
    }

    return new JsonResponse($readyData, 200, ["Access-Control-Allow-Origin" => "*"]);
});

$app->get('/files/{id}', function (Request $request, Response $response, $args) use($db) {
    $query = $db->prepare("SELECT * FROM model WHERE id=?");
    $query->execute([$args['id']]);
    $data = $query->fetch(PDO::FETCH_ASSOC);

    return new JsonResponse([
        "id" => $data['id'],
        "title" => $data['title'],
        "file" => base64_encode($data['fileData']),
    ], 200, ["Access-Control-Allow-Origin" => "*"]);
});

$app->get('/files/{id}/products', function (Request $request, Response $response, $args) use($db) {
    $query = $db->prepare("SELECT element_id, product_id, clash_type FROM metadata WHERE model_id=?");
    $query->execute([$args['id']]);
    $data = $query->fetchAll(PDO::FETCH_ASSOC);
    return new JsonResponse($data, 200, ["Access-Control-Allow-Origin" => "*"]);
});

$app->get('/files/{id}/products/{element_id}', function (Request $request, Response $response, $args) use($db) {
    $query = $db->prepare("SELECT product_id, clash_type FROM metadata WHERE model_id=? AND element_id=?");
    $query->execute([$args['id'], $args['element_id']]);
    $data = $query->fetch(PDO::FETCH_ASSOC);
    if(!isset($data) || !$data) return new JsonResponse(false, 200, ["Access-Control-Allow-Origin" => "*"]);
    $foundData = isset($data["product_id"]) ? searchProducts($data["product_id"]): [];
    return new JsonResponse(["product_id"=>$data["product_id"], "clash_type"=>$data["clash_type"], "img" => isset($foundData[0])? $foundData[0]["img"]:null], 200, ["Access-Control-Allow-Origin" => "*"]);
});

$app->post('/files/{model_id}/products', function (Request $request, Response $response, $args) use($db) {
    $data = json_decode($request->getBody()->getContents(), true);
    $db->prepare("UPDATE metadata SET product_id=? WHERE element_id=? AND model_id=?")->execute([$data["product_id"], $data['element_id'], $args['model_id']]);
    return new JsonResponse(["id" => $data['element_id']], 200, ["Access-Control-Allow-Origin" => "*"]);
});
$app->get('/products', function (Request $request, Response $response, $args) {
    $search = isset($request->getQueryParams()['search']) ? $request->getQueryParams()['search'] : "";
    

    $parsedData = searchProducts($search);
   
    return new JsonResponse($parsedData, 200, ["Access-Control-Allow-Origin" => "*"]);
});

$app->get('/files/{model_id}/info', function (Request $request, Response $response, $args) use($db) {
    $query = $db->prepare("SELECT * FROM model WHERE id=?");
    $query->execute([$args['model_id']]);
    $model = $query->fetch(PDO::FETCH_ASSOC);

    $query = $db->prepare("SELECT product_id, count(*) as amount FROM metadata WHERE model_id=? GROUP BY product_id");
    $query->execute([$model['id']]);
    $metadata = $query->fetchAll(PDO::FETCH_ASSOC);   
    return new JsonResponse(["title"=> $model["title"], "metadata" => $metadata], 200, ["Access-Control-Allow-Origin" => "*"]);
});

function searchProducts($search) {
    $data = json_decode(file_get_contents(__DIR__ ."/../transformed_peikko_products.json"), true);
    $parsedData = filterData($data);
    if($search != ""){
        $parsedData = array_filter($parsedData, function($item) use($search){
            return strpos($item["product_id"], $search) !== false;
        });
    }
    return $parsedData;
}

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