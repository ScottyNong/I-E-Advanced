<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST'); // Assurez-vous d'autoriser la méthode POST
header('Access-Control-Allow-Headers: Content-Type');

// Récupérer les données JSON envoyées dans le corps de la requête
$data = json_decode(file_get_contents("php://input"), true);

// Vérifier si les données nécessaires sont présentes
if (isset($data['userId']) && isset($data['timestamp'])) {
    $userId = $data['userId'];
    $timestamp = $data['timestamp'];

    $file = 'postits.csv';
    $tempFile = 'temp_postits.csv';

    $fileHandle = fopen($file, 'r');
    $tempFileHandle = fopen($tempFile, 'w');

    if ($fileHandle && $tempFileHandle) {
        $deleted = false;
        while (($line = fgetcsv($fileHandle)) !== false) {
            if ($line[4] == $userId && $line[5] == $timestamp) {
                // Cette ligne correspond au post-it à supprimer
                $deleted = true;
            } else {
                // Écrire toutes les autres lignes dans le fichier temporaire
                fputcsv($tempFileHandle, $line);
            }
        }

        fclose($fileHandle);
        fclose($tempFileHandle);

        // Remplacer l'ancien fichier par le fichier temporaire
        if (rename($tempFile, $file)) {
            if ($deleted) {
                echo json_encode(['message' => 'Post-it supprimé avec succès']);
            } else {
                echo json_encode(['message' => 'Aucun post-it trouvé avec ces informations']);
            }
        } else {
            echo json_encode(['error' => 'Erreur lors du remplacement du fichier']);
        }
    } else {
        echo json_encode(['error' => 'Erreur lors de l\'ouverture des fichiers']);
    }
} else {
    echo json_encode(['error' => 'Données manquantes']);
}
?>
