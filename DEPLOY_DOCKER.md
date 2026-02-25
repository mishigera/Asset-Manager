# Deploy con Docker

## 1) Variables de entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL=postgresql://usuario:password@host:5432/base_de_datos
```

> `DATABASE_URL` es obligatoria para que el backend arranque.

## 2) Build y ejecución con Docker Compose

```bash
docker compose up -d --build
```

La app quedará disponible en:
- `http://TU_SERVIDOR:5000`

## 3) Ver logs

```bash
docker compose logs -f asset-manager
```

## 4) Detener

```bash
docker compose down
```

## 5) Deploy en actualización
Cada vez que subas cambios:

```bash
docker compose up -d --build
```

## Opción sin Compose

```bash
docker build -t asset-manager:latest .
docker run -d \
  --name asset-manager \
  --restart unless-stopped \
  -p 5000:5000 \
  --env-file .env \
  asset-manager:latest
```
