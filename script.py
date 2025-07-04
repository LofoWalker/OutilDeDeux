import json

# Charger le fichier d'origine
with open("questions.json", "r", encoding="utf-8") as f:
    questions = json.load(f)

# Mapping des niveaux de difficulté
niveau_difficulte = {
    "Débutant": 1,
    "Intermédiaire": 2,
    "Avancé": 3,
    "Expert": 4  # Optionnel, si jamais nécessaire plus tard
}

# Réorganisation par catégorie
categories = {}
for question in questions:
    categorie = question["Domaine"]
    if categorie not in categories:
        categories[categorie] = []
    
    nouvelle_question = {
        "question": question["Question"],
        "reponses": [] if question["Réponse"] == "[Réponse manquante]" else [question["Réponse"]],
        "difficulte": niveau_difficulte.get(question["Difficulté"], 1)  # Défault à 1 si difficulté inconnue
    }
    categories[categorie].append(nouvelle_question)

# Structure finale
structure_finale = {
    "categories": [
        {"nom": nom, "questions": questions}
        for nom, questions in categories.items()
    ]
}

# Sauvegarde dans un nouveau fichier JSON
with open("questions_restructurees.json", "w", encoding="utf-8") as f:
    json.dump(structure_finale, f, ensure_ascii=False, indent=2)

print("Fichier JSON restructuré avec succès sous 'questions_restructurees.json'")
