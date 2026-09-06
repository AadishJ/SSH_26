# Retina Signal frontend

This is a dependency-free browser client for the FastAPI MATLAB inference service.

## Run

Start the backend on port `8000`, then serve this folder from the project root:

```bash
python -m http.server 5173 --directory frontend
```

Open <http://localhost:5173>. The browser sends the selected image to `POST http://localhost:8000/predict`.

To use another backend URL, define `window.RETINA_API_URL` before `app.js` loads, or change the `API_URL` constant in `app.js`.
