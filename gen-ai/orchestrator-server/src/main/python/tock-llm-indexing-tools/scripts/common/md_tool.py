import re
import tiktoken  # Assurez-vous d'avoir installé tiktoken: pip install tiktoken


def clean_markdown(md_text: str) -> str:
    # Supprimer le gras et l'italique (ex: **gras**, *italique*)
    md_text = re.sub(r'\*\*(.*?)\*\*', r'\1', md_text)  # Gras
    md_text = re.sub(r'\*(.*?)\*', r'\1', md_text)  # Italique
    md_text = re.sub(r'__(.*?)__', r'\1', md_text)  # Gras avec __
    md_text = re.sub(r'_(.*?)_', r'\1', md_text)  # Italique avec _

    # Supprimer les titres Markdown (# Title)
    md_text = re.sub(r'^#{1,6}\s+', '', md_text, flags=re.MULTILINE)

    # Nettoyer les tableaux Markdown (réduire les espaces et les séparateurs)
    md_text = re.sub(r'\|', ' ', md_text)  # Remplacer les pipes
    md_text = re.sub(r'-{3,}', '', md_text)  # Supprimer les séparateurs des tableaux

    # Supprimer les listes Markdown (-, *, +)
    md_text = re.sub(r'^[\-*+]\s+', '', md_text, flags=re.MULTILINE)

    # Supprimer l'excès d'espaces
    md_text = re.sub(r'\s+', ' ', md_text).strip()

    return md_text


def count_tokens(text: str, model: str = "gpt-3.5-turbo") -> int:
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))


# Exemple d'utilisation
md_example = """
# Titre principal

**Texte en gras** et *texte en italique*.

| Colonne 1 | Colonne 2 |
|-----------|-----------|
| Valeur 1  | Valeur 2  |

- Élément de liste
"""

cleaned_md = clean_markdown(md_example)
n_tokens = count_tokens(cleaned_md)

print("Texte nettoyé:", cleaned_md)
print("Nombre de tokens:", n_tokens)