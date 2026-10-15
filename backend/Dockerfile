FROM python:3.11-slim
RUN useradd --create-home --uid 10001 app
WORKDIR /srv
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app
USER app
ENV PORT=8000
HEALTHCHECK CMD python -c "import urllib.request,os;urllib.request.urlopen('http://localhost:'+os.environ['PORT']+'/health')"
# --no-server-header hides the uvicorn banner; --limit-concurrency sheds load with 503 before the app is overloaded.
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --no-server-header --limit-concurrency 50 --timeout-keep-alive 5
