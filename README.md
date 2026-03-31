# Echo 🔊

Echo is a minimal full-stack application featuring a high-performance **ASP.NET** backend and a responsive **Next.js** frontend. The project is designed with scalability and containerization in mind, utilizing **Docker** for streamlined deployment and a **PostgreSQL** database for robust data management.

## 🛠️ Technology Stack

### Back-End
- **Runtime**: .NET 10.0 (ASP.NET Core)
- **Database Provider**: Npgsql (PostgreSQL)
- **ORM**: Entity Framework Core
- **Validation**: FluentValidation
- **Documentation**: Swagger/OpenAPI

### Front-End
- **Framework**: Next.js 
- **Library**: React 
- **Styling**: Tailwind CSS
- **Font**: Vazirmatn

## 🏗️ Getting Started

### Running with Docker
The easiest way to get the entire stack running is using Docker Compose:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MahdiyarGHD/Echo.git
   cd Echo
   ```

2. **Start the services:**
   ```bash
   docker-compose up -d
   ```

The application will be available at:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Swagger UI**: [http://localhost:5000/swagger](http://localhost:5000/swagger)

## 📁 Project Structure

```text
Echo/
├── src/
│   ├── Back-End/        # ASP.NET Core Web API
│   │   └── Echo/
│   │       ├── Features/  # Domain logic and endpoints
│   │       └── Common/    # Shared utilities and helpers
│   └── Front-End/       # Next.js Application
│       ├── app/           # Next.js App Router
│       ├── components/    # Reusable UI components
│       └── lib/           # Client-side utilities
├── docker-compose.yml   # Multi-container orchestration
└── Echo.slnx         
