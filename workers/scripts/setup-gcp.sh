#!/bin/bash
# ============================================================
# TITANIUM GYM - GCP Cloud SQL Setup
# Región: southamerica-west1 (Santiago, Chile)
# ============================================================

set -e

PROJECT_ID=${GCP_PROJECT_ID:-""}
INSTANCE_NAME="titanium-db"
DB_NAME="titanium"
DB_USER="titanium_app"
REGION="southamerica-west1"

echo "🔧 Configurando GCP Cloud SQL para Titanium Gym..."

# Verificar proyecto
if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: Define GCP_PROJECT_ID"
  echo "   export GCP_PROJECT_ID=tu-proyecto-id"
  exit 1
fi

echo "📦 Proyecto: $PROJECT_ID"
echo "🌎 Región: $REGION (Santiago)"

# 1. Habilitar APIs necesarias
echo ""
echo "1️⃣ Habilitando APIs..."
gcloud services enable sqladmin.googleapis.com --project=$PROJECT_ID
gcloud services enable compute.googleapis.com --project=$PROJECT_ID

# 2. Crear instancia Cloud SQL
echo ""
echo "2️⃣ Creando instancia PostgreSQL..."
gcloud sql instances create $INSTANCE_NAME \
  --project=$PROJECT_ID \
  --database-version=POSTGRES_15 \
  --region=$REGION \
  --tier=db-f1-micro \
  --storage-size=10GB \
  --storage-type=SSD \
  --availability-type=zonal \
  --assign-ip

# 3. Crear base de datos
echo ""
echo "3️⃣ Creando base de datos..."
gcloud sql databases create $DB_NAME \
  --instance=$INSTANCE_NAME \
  --project=$PROJECT_ID

# 4. Crear usuario
echo ""
echo "4️⃣ Creando usuario..."
DB_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24)
gcloud sql users create $DB_USER \
  --instance=$INSTANCE_NAME \
  --password=$DB_PASSWORD \
  --project=$PROJECT_ID

# 5. Obtener IP pública
echo ""
echo "5️⃣ Obteniendo IP..."
INSTANCE_IP=$(gcloud sql instances describe $INSTANCE_NAME \
  --project=$PROJECT_ID \
  --format="value(ipAddresses[0].ipAddress)")

# 6. Autorizar IP (para desarrollo - agregar tu IP)
echo ""
echo "6️⃣ Para autorizar tu IP de desarrollo:"
echo "   gcloud sql instances patch $INSTANCE_NAME --authorized-networks=TU_IP/32 --project=$PROJECT_ID"

# 7. Connection string
CONNECTION_STRING="postgresql://$DB_USER:$DB_PASSWORD@$INSTANCE_IP:5432/$DB_NAME"

echo ""
echo "============================================================"
echo "✅ Cloud SQL creado exitosamente!"
echo "============================================================"
echo ""
echo "📝 Datos de conexión:"
echo "   Host: $INSTANCE_IP"
echo "   Puerto: 5432"
echo "   Base de datos: $DB_NAME"
echo "   Usuario: $DB_USER"
echo "   Password: $DB_PASSWORD"
echo ""
echo "🔗 Connection String (guardar en lugar seguro):"
echo "   $CONNECTION_STRING"
echo ""
echo "📌 Siguiente paso - Crear Hyperdrive:"
echo "   cd workers"
echo "   npx wrangler hyperdrive create titanium-db --connection-string=\"$CONNECTION_STRING\""
echo ""
echo "⚠️  Guarda la contraseña en un lugar seguro, no se puede recuperar."
