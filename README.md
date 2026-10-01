# AI Document Change Detector

## Prerequisites
- Node.js (v18+)
- Python (3.9+)
- Firebase Account (for Auth)
- OpenAI / LLM Provider Key (for full semantic analysis)

## Local Development

### 1. Backend Setup
Open a terminal (PowerShell) in the `backend` folder:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
The API will run at `http://localhost:8000`.

### 2. Frontend Setup
Open a separate terminal in the `frontend` folder:
```powershell
cd frontend
npm install
npm run dev
```
The app will run at `http://localhost:5173`.

## AWS EC2 Deployment Guide

1. **Provision EC2 Instance**: Create an Ubuntu 22.04 LTS instance on AWS.
2. **Security Groups**: Open ports 22 (SSH for your IP), 80 (HTTP), and 443 (HTTPS).
3. **Connect and Update**:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y python3-pip python3-venv nodejs npm nginx certbot python3-certbot-nginx
   ```
4. **Deploy Backend**:
   - Clone your code.
   - Set up `venv` and install requirements.
   - Create a systemd service `/etc/systemd/system/fastapi.service` to run Uvicorn on port 8000.
   - `sudo systemctl enable fastapi && sudo systemctl start fastapi`
5. **Deploy Frontend**:
   - Run `npm run build` in `frontend/`.
   - Copy `dist/` to `/var/www/html`.
6. **Configure Nginx**:
   - Create a server block in `/etc/nginx/sites-available/default` pointing `/` to `/var/www/html` and `/api/` to `http://localhost:8000`.
   - Restart Nginx.
7. **SSL**: `sudo certbot --nginx -d yourdomain.com`

## Firebase Auth (Google & Apple)
1. Go to Firebase Console -> Authentication -> Sign-in methods.
2. Enable Google (add your support email and domain).
3. Enable Apple (requires Apple Developer Account, Services ID, and Key). Add the callback URL `https://yourdomain.com/__/auth/handler` to your Apple Developer portal.

## Testing
Run backend tests:
```powershell
cd backend
.\venv\Scripts\activate
pytest tests/
```
