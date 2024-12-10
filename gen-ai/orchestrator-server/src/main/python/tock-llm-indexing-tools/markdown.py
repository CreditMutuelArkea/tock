import os
from datetime import datetime

# Répertoires d'entrée et de sortie
input_dir = "input"
output_dir = "output"

# Assurez-vous que le répertoire de sortie existe
os.makedirs(output_dir, exist_ok=True)

# Parcourt tous les fichiers dans le répertoire d'entrée
for filename in os.listdir(input_dir):
    if filename.endswith(".md"):  # Prend uniquement les fichiers .md
        input_path = os.path.join(input_dir, filename)
        with open(input_path, 'r', encoding='utf-8') as file:
            # Lis le contenu du fichier et extrait les 3 premières lignes
            lines = file.readlines()
            first_three_lines = lines[:3]

        # Prépare le chemin de sortie avec un horodatage
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        output_filename = f"{os.path.splitext(filename)[0]}_{timestamp}.md"
        output_path = os.path.join(output_dir, output_filename)

        # Écrit le contenu dans le fichier de sortie
        with open(output_path, 'w', encoding='utf-8') as output_file:
            output_file.write(f"Filename: {filename}\n")
            output_file.write("".join(first_three_lines))

print("Traitement terminé !")
