# =================================================================
# PetSOS — Automated Google Cloud Setup Script for GitHub Actions
# =================================================================

param (
    [Parameter(Mandatory=$true)]
    [string]$ProjectId,

    [Parameter(Mandatory=$false)]
    [string]$Region = "me-west1"
)

Write-Host "🐾 Starting Google Cloud Environment Setup for PetSOS..." -ForegroundColor Cyan
Write-Host "Project ID: $ProjectId | Region: $Region" -ForegroundColor Yellow

# 1. Configure Project
gcloud config set project $ProjectId --quiet

# 2. Enable Required APIs
Write-Host "`n📦 [1/5] Enabling Google Cloud Services (Cloud Run, Artifact Registry, IAM)..." -ForegroundColor Green
gcloud services enable run.googleapis.com `
                       artifactregistry.googleapis.com `
                       cloudbuild.googleapis.com `
                       iam.googleapis.com --quiet

# 3. Create Artifact Registry Docker Repository
Write-Host "`n📦 [2/5] Creating Artifact Registry Repository (petsos-repo)..." -ForegroundColor Green
gcloud artifacts repositories create petsos-repo `
    --repository-format=docker `
    --location=$Region `
    --description="PetSOS Production Docker Images" --quiet 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "ℹ️ Repository 'petsos-repo' already exists or created." -ForegroundColor Yellow
}

# 4. Create Service Account
Write-Host "`n👤 [3/5] Creating GitHub Actions Service Account..." -ForegroundColor Green
gcloud iam service-accounts create github-actions-deployer `
    --display-name="GitHub Actions Cloud Run Deployer" --quiet 2>$null

$SA_EMAIL = "github-actions-deployer@$ProjectId.iam.gserviceaccount.com"

# 5. Grant IAM Permissions
Write-Host "`n🔑 [4/5] Granting IAM Roles to Service Account..." -ForegroundColor Green
$roles = @(
    "roles/run.admin",
    "roles/artifactregistry.writer",
    "roles/iam.serviceAccountUser",
    "roles/storage.admin"
)

foreach ($role in $roles) {
    Write-Host "   -> Binding $role" -ForegroundColor DarkGray
    gcloud projects add-iam-policy-binding $ProjectId `
        --member="serviceAccount:$SA_EMAIL" `
        --role=$role --quiet | Out-Null
}

# 6. Generate Key JSON
Write-Host "`n📄 [5/5] Generating Service Account Key..." -ForegroundColor Green
$keyPath = Join-Path $PSScriptRoot "gcp-sa-key.json"
gcloud iam service-accounts keys create $keyPath `
    --iam-account=$SA_EMAIL --quiet

Write-Host "`n🎉 Setup Complete!" -ForegroundColor Green
Write-Host "=================================================================="
Write-Host "1. Open the file: $keyPath" -ForegroundColor Cyan
Write-Host "2. Copy the entire JSON content into your GitHub Repository Secrets as:" -ForegroundColor Cyan
Write-Host "   Secret Name:  GCP_SA_KEY" -ForegroundColor Yellow
Write-Host "   Secret Name:  GCP_PROJECT_ID  (Value: $ProjectId)" -ForegroundColor Yellow
Write-Host "   Secret Name:  GCP_REGION      (Value: $Region)" -ForegroundColor Yellow
Write-Host "=================================================================="
