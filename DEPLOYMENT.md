# MediNote AI – 10-Minute Deployment Guide 🚀

Follow these steps to get your Ambient Clinical Intelligence system live.

---

## 1. Backend Deployment (Render.com)
*Estimated Time: 4 Minutes*

1. **Sign up/Log in** to [Render.com](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Set the following configurations:
   - **Name**: `medscribe-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables**:
   - Click **Advanced** and add:
     - `DATABASE_URL`: `sqlite:///./medscribe.db` (or your PostgreSQL URL)
6. Click **Create Web Service**. 
   *Copy the provided URL (e.g., `https://medscribe-backend.onrender.com`).*

---

## 2. Frontend Deployment (Vercel)
*Estimated Time: 3 Minutes*

1. **Sign up/Log in** to [Vercel](https://vercel.com).
2. Click **Add New** > **Project**.
3. Import your GitHub repository.
4. Set the following configurations:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Next.js`
5. **Environment Variables**:
   - Add `NEXT_PUBLIC_API_URL`
   - **Value**: The URL you copied from Render (e.g., `https://medscribe-backend.onrender.com`)
6. Click **Deploy**.

---

## 3. Post-Deployment Verification
*Estimated Time: 3 Minutes*

1. Open your Vercel URL.
2. Navigate to the **Record** page and ensure the Microphone initializes.
3. Check the **Analytics** and **Patients** pages to ensure data is fetching from the backend.
4. Verify that PDF export works on the **Reports** page.

---

### ⚠️ Critical Notes
- **CORS**: The backend is already configured to allow `*` origins, which works for initial deployment. For production, restrict this in `main.py` to your Vercel URL.
- **HTTPS**: Voice recording (`navigator.mediaDevices.getUserMedia`) **requires** a secure HTTPS connection. Both Vercel and Render provide this by default.
- **Database**: The default SQLite database will reset on Render restarts. For persistent patient data, connect a managed PostgreSQL instance (e.g., via Supabase or Neon) and update the `DATABASE_URL`.

---
**Deployment Support**: Refer to `README.md` for full technical specifications.
