import logging
import os
from datetime import datetime
import colorlog

app_logger = None

def configure_logging(cli_args):
    global app_logger
    if app_logger is not None:
        return app_logger

    # Créer un répertoire "logs" s'il n'existe pas
    os.makedirs("logs", exist_ok=True)

    # Format de log pour la console (avec coloration)
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(module)s - %(message)s"

    # Nom du fichier de log avec horodatage
    log_filename = f"logs/log_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.log"

    app_logger = logging.getLogger(__name__)

    # Configuration du gestionnaire de fichier (sans couleur pour le fichier)
    file_handler = logging.FileHandler(log_filename)
    file_handler.setFormatter(logging.Formatter(log_format))

    # Configuration du gestionnaire de console (avec coloration)
    console_handler = colorlog.StreamHandler()
    console_handler.setFormatter(colorlog.ColoredFormatter(f"%(log_color)s{log_format}"))

    # Configuration du logger
    app_logger.propagate = False

    # Ajouter les gestionnaires au logger
    app_logger.setLevel(logging.DEBUG if cli_args['-v'] else logging.INFO)
    app_logger.addHandler(file_handler)
    app_logger.addHandler(console_handler)

    return app_logger