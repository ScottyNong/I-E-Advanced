<?php
// Définir le fichier log où seront enregistrées les actions des utilisateurs
$logFile = 'user_activity_log.json';

// Vérifier si les données ont été envoyées en POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Récupérer les données JSON envoyées par le client
    $logData = json_decode(file_get_contents('php://input'), true);

    // Vérifier si les données sont valides
    if (isset($logData['email']) && isset($logData['action']) && isset($logData['timestamp'])) {
        // Préparer l'enregistrement de log
        $logEntry = [
            'email' => $logData['email'],
            'action' => $logData['action'],
            'timestamp' => $logData['timestamp'],
            'post_id' => isset($logData['post_id']) ? $logData['post_id'] : null, // Optionnel, pour les actions liées aux post-its
            'post_content' => isset($logData['post_content']) ? $logData['post_content'] : null // Optionnel, pour les actions liées aux post-its
        ];

        // Vérifier si le fichier log existe déjà
        if (file_exists($logFile)) {
            // Lire le fichier log existant
            $existingLogs = json_decode(file_get_contents($logFile), true);
        } else {
            // Si le fichier n'existe pas, initialiser un tableau vide
            $existingLogs = [];
        }

        // Ajouter le nouvel enregistrement dans le tableau des logs
        $existingLogs[] = $logEntry;

        // Sauvegarder les logs mis à jour dans le fichier
        file_put_contents($logFile, json_encode($existingLogs, JSON_PRETTY_PRINT));

        // Répondre avec un statut de succès
        echo json_encode(['success' => true]);
    } else {
        // Si les données sont invalides, renvoyer une erreur
        echo json_encode(['error' => 'Données manquantes ou invalides.']);
    }
} else {
    // Si la méthode de requête n'est pas POST, renvoyer une erreur
    echo json_encode(['error' => 'Méthode non autorisée.']);
}
?>
