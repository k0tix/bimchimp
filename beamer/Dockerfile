FROM python:3.10.9

WORKDIR /beamer

COPY . /beamer

RUN python -m pip install --upgrade pip
RUN python -m pip install -r requirements.txt --no-cache-dir

EXPOSE 5000

ENV FLASK_APP app.py

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
