FROM python:3.11.4

WORKDIR /beamer

COPY . /beamer

RUN python -m pip install -e . --no-cache-dir

EXPOSE 5000

ENV FLASK_APP app.py

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
