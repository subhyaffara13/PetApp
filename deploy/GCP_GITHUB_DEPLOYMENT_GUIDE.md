# 🚀 PetSOS — Google Cloud Deployment via GitHub Actions

This guide explains how to connect your GitHub repository to Google Cloud so that **every `git push` automatically tests, builds, and deploys your Backend, Frontend, and 3 Portals to Google Cloud Run**.

---

## ⚡ Step 1: Set Up Google Cloud (Run in Terminal / Cloud Shell)

Run these commands in PowerShell or Google Cloud Shell:

```powershell
# 1. Set your GCP Project ID
$PROJECT_ID = "YOUR_GCP_PROJECT_ID"
gcloud config set project $PROJECT_ID

# 2. Choose your deployment region (me-west1 for Tel Aviv / Middle East, or us-central1)
$REGION = "me-west1"

# 3. Enable required Google Cloud APIs
gcloud services enable run.googleapis.com `
                       artifactregistry.googleapis.com `
                       cloudbuild.googleapis.com `
                       iam.googleapis.com

# 4. Create Artifact Registry Docker Repository
gcloud artifacts repositories create petsos-repo `
    --repository-format=docker `
    --location=$REGION `
    --description="PetSOS Production Docker Images"

# 5. Create a Service Account for GitHub Actions
gcloud iam service-accounts create github-actions-deployer `
    --display-name="GitHub Actions Cloud Run Deployer"

$SA_EMAIL = "github-actions-deployer@$PROJECT_ID.iam.gserviceaccount.com"

# 6. Grant Necessary IAM Roles to the Service Account
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="roles/run.admin"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="roles/artifactregistry.writer"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="roles/iam.serviceAccountUser"
gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$SA_EMAIL" --role="roles/storage.admin"

# 7. Generate Service Account Key JSON
gcloud iam service-accounts keys create gcp-sa-key.json `
    --iam-account=$SA_EMAIL

Write-Host "✅ Key saved to gcp-sa-key.json! Copy its contents into GitHub Secrets as GCP_SA_KEY."
```

---

## 🔐 Step 2: Add Secrets to GitHub Repository

Go to your GitHub repository:
**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add the following secrets:

### Required Cloud & Core Secrets:
| Secret Name | Value |
|---|---|
| `GCP_PROJECT_ID` | Your Google Cloud project ID |
| `GCP_REGION` | `me-west1` (or `us-central1`) |
| `GCP_SA_KEY` | Entire contents of `gcp-sa-key.json` file |
| `MONGO_DB_CONNECTION_STRING` | Your MongoDB Atlas connection URI |
| `JWT_SECRET` | 64-character random string |
| `JWT_REFRESH_SECRET` | 64-character random string |
| `ADMIN_SECRET_TOKEN` | Secret access token for the Super Admin Portal |

### Third-Party Integrations:
| Secret Name | Value |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` (or test key) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` from Stripe webhook |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` (or test key) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Web Client ID |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary name |
| `CLOUDINARY_API_KEY` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret |
| `RESEND_API_KEY` | Free API key from [resend.com](https://resend.com) (`re_...`) |
| `GEMINI_API_KEY` | (Optional) Google Gemini AI key |
| `GOOGLE_PLACES_API_KEY` | (Optional) Google Maps Places key |

---

## 🚀 Step 3: Trigger Deployment

Once your secrets are added:

1. **Commit and push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: setup production CI/CD for Google Cloud Run"
   git push origin main
   ```

2. **Watch the live deployment**:
   Go to the **Actions** tab on your GitHub repository. The `Deploy to Google Cloud Run via GitHub` workflow will automatically:
   - Run all 30 unit tests across 7 test suites
   - Build lean multi-stage Docker images
   - Deploy `petsos-api` (Backend) to Cloud Run
   - Inject the live backend URL into the customer frontend and portals
   - Deploy `petsos-frontend`, `petsos-clinic-portal`, `petsos-store-portal`, and `petsos-admin-portal` to Cloud Run
   - Output your live HTTPS URLs for each application!
