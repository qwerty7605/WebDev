# Complaint Management System - Setup Guide

This guide will help you set up the Complaint Management System on your local machine.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ and npm installed (for Angular development)
- Git installed

## Project Structure

```
.
├── Angular/          # Frontend (Angular)
└── laravel/          # Backend (Laravel API)
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-folder>
```

### 2. Backend Setup (Laravel)

#### 2.1. Configure Environment File

```bash
cd laravel
cp .env.example .env
```

#### 2.2. Update `.env` File

Open `laravel/.env` and verify/update these settings:

```env
# Application
APP_NAME="Complaint System"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

# Database (matches docker-compose.yml)
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=complaint_system
DB_USERNAME=complaint_system
DB_PASSWORD=complaint_system
```

**IMPORTANT**: The `APP_KEY` will be generated in the next step. If you see an existing key, you can keep it or generate a new one.

#### 2.3. Start Docker Containers

```bash
docker-compose up -d
```

This will start:
- **PHP-FPM** container (Laravel application)
- **Nginx** container (Web server) - Port 80
- **MySQL** container - Port 3306
- **phpMyAdmin** container - Port 8080

#### 2.4. Install Dependencies & Setup Laravel

```bash
# Access the PHP container
docker-compose exec php bash

# Inside the container:
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed   # Optional: seed initial data

# Exit the container
exit
```

#### 2.5. Verify Backend

Visit http://localhost to check if Laravel is running. You should see the Laravel welcome page or your API.

### 3. Frontend Setup (Angular)

#### 3.1. Install Dependencies

```bash
cd ../Angular
npm install
```

#### 3.2. Configure API URL

The API URL is already configured in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:80/api'
};
```

**If your backend runs on a different port or domain**, update this file accordingly.

#### 3.3. Start Development Server

```bash
npm start
# or
ng serve
```

The Angular app will be available at http://localhost:4200

### 4. Access the Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost/api
- **phpMyAdmin**: http://localhost:8080

## Configuration Files That Need Attention

### Files You MUST Configure

1. **`laravel/.env`** - Copy from `.env.example` and update:
   - `APP_KEY` (generate with `php artisan key:generate`)
   - Database credentials (if different from docker-compose.yml)
   - Mail settings (if you want email notifications)

2. **`Angular/src/environments/environment.ts`** - Update if:
   - Backend runs on different port (not 80)
   - Backend runs on different domain
   - You're deploying to production

### Files You MAY Need to Configure

3. **`laravel/docker-compose.yml`** - Update if:
   - Ports 80, 3306, or 8080 are already in use:
     ```yaml
     nginx:
       ports:
         - "8000:80"  # Change 8000 to any available port
     ```
   - You want to change database credentials:
     ```yaml
     mysql:
       environment:
         MYSQL_ROOT_PASSWORD: <your-password>
         MYSQL_DATABASE: <your-database>
         MYSQL_USER: <your-username>
         MYSQL_PASSWORD: <your-password>
     ```
     **Note**: If you change these, also update `laravel/.env`

4. **`laravel/nginx/default.conf`** - Usually doesn't need changes
   - Only modify if you have custom nginx requirements

## Default Admin Account

After running migrations and seeders (if you created a seeder), you can create an admin account directly in the database or via a seeder.

**To create an admin manually:**

1. Access phpMyAdmin at http://localhost:8080
2. Navigate to the `admins` table
3. Insert a new record with hashed password (use `bcrypt` or Laravel tinker)

Or use Laravel Tinker:

```bash
docker-compose exec php php artisan tinker

# Inside tinker:
$admin = new App\Models\Admin();
$admin->username = 'admin';
$admin->email = 'admin@example.com';
$admin->password = bcrypt('password123');
$admin->full_name = 'System Administrator';
$admin->role = 'Super Admin';
$admin->is_active = true;
$admin->save();
exit
```

## Common Issues & Solutions

### Port Already in Use

If port 80, 3306, or 8080 is already in use:

```bash
# Check what's using the port
sudo lsof -i :80
sudo lsof -i :3306
sudo lsof -i :8080

# Update docker-compose.yml to use different ports
# Example: Change "80:80" to "8000:80"
```

Then update `Angular/src/environments/environment.ts`:
```typescript
apiUrl: 'http://localhost:8000/api'  // Match your nginx port
```

### Database Connection Refused

Make sure the MySQL container is running:

```bash
docker-compose ps
docker-compose logs mysql
```

### CORS Errors

The Laravel backend should have CORS configured. If you see CORS errors:

1. Check `laravel/config/cors.php`
2. Ensure `'paths' => ['api/*']` is present
3. Restart Docker containers: `docker-compose restart`

### Permission Issues (Linux/Mac)

```bash
cd laravel
sudo chown -R $USER:$USER storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

## Development Workflow

### Backend Changes (Laravel)

```bash
# Run migrations
docker-compose exec php php artisan migrate

# Clear cache
docker-compose exec php php artisan cache:clear
docker-compose exec php php artisan config:clear
```

### Frontend Changes (Angular)

Angular has hot-reload enabled by default. Just save your files and the browser will auto-refresh.

## Stopping the Application

```bash
# Stop backend
cd laravel
docker-compose down

# Stop frontend (Ctrl+C in the terminal running ng serve)
```

## Production Deployment Notes

1. Update `Angular/src/environments/environment.prod.ts` with production API URL
2. Build Angular for production: `ng build --configuration production`
3. Update Laravel `.env` for production settings
4. Use proper database credentials
5. Set `APP_DEBUG=false` in Laravel
6. Configure proper web server (nginx/apache) instead of Docker for production
7. Enable HTTPS/SSL

## Need Help?

- Laravel Documentation: https://laravel.com/docs
- Angular Documentation: https://angular.dev
- Docker Documentation: https://docs.docker.com

## Summary of Configuration Files

| File | Required | Purpose |
|------|----------|---------|
| `laravel/.env` | **YES** | Backend configuration (database, app settings) |
| `Angular/src/environments/environment.ts` | **YES** | Frontend API URL configuration |
| `laravel/docker-compose.yml` | Maybe | Port and database credential configuration |
| `laravel/nginx/default.conf` | No | Nginx server configuration |

That's it! Your Complaint Management System should now be up and running.
