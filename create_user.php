<?php
// Récupération des données envoyées via POST
$data = json_decode(file_get_contents("php://input"), true);

// Vérification si les données sont présentes
if (isset($data['email']) && isset($data['password'])) {
    $email = $data['email'];
    $password = password_hash($data['password'], PASSWORD_DEFAULT); // Hashage du mot de passe pour plus de sécurité

    // Vérifier si le fichier user.csv est accessible
    $file = 'user.csv';
    $userExist = false;

    // Ouvrir le fichier user.csv en lecture pour vérifier si l'email existe déjà
    if (($handle = fopen($file, "r")) !== FALSE) {
        while (($row = fgetcsv($handle)) !== FALSE) {
            if ($row[0] === $email) {  // Vérification de l'email
                $userExist = true;
                break;
            }
        }
        fclose($handle);
    }

    // Si l'email existe déjà, renvoyer un message d'erreur
    if ($userExist) {
        echo json_encode([
            "success" => false,
            "message" => "Cet email est déjà utilisé. Veuillez en choisir un autre."
        ]);
    } else {
        // Si l'utilisateur n'existe pas, on l'ajoute au fichier CSV
        if (($handle = fopen($file, "a")) !== FALSE) {
            fputcsv($handle, [$email, $password]);  // Enregistrer email et mot de passe
            fclose($handle);
            echo json_encode([
                "success" => true,
                "message" => "Utilisateur créé avec succès. Vous pouvez maintenant vous connecter."
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Erreur lors de l'enregistrement de l'utilisateur."
            ]);
        }
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Email et mot de passe sont requis."
    ]);
}
?>
