from app import app
import logging
from logging.handlers import TimedRotatingFileHandler#RotatingFileHandler

if __name__ == "__main__":
    app.run(host='0.0.0.0')

if __name__ != "__main__": # Being run through gunicorn
    gunicorn_logger = logging.getLogger("gunicorn.error")

    # Create the Handler for logging data to a file
    logger_handler = TimedRotatingFileHandler('logs/application.log', when='midnight', backupCount=10, utc=True)#, maxBytes=100, backupCount=0) # We allow a log file of 100KB
    logger_handler.setLevel(gunicorn_logger.level)

    # Create a Formatter for formatting the log messages
    logger_formatter = logging.Formatter("[%(asctime)s] %(name)s - %(levelname)s : %(message)s")

    # Add the Formatter to the Handler
    logger_handler.setFormatter(logger_formatter)
