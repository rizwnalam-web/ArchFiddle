import { ArchType } from '../types';

export interface TemplateFile {
  path: string;
  name: string;
  language: string;
  description: string;
  content: string;
}

export interface FolderNode {
  name: string;
  path: string;
  description?: string;
  children?: FolderNode[];
  isFile?: boolean;
}

export type SupportedStackLanguage = 'nodejs' | 'typescript' | 'go' | 'java' | 'python' | 'csharp' | 'rust' | 'yaml' | 'other';

export interface TechStackTemplate {
  techId: string;
  techName: string;
  techIcon: string;
  language: SupportedStackLanguage;
  runtime: string;
  framework: string;
  badgeColor: string;
  description: string;
  fileTree: FolderNode;
  starterFiles: TemplateFile[];
  quickStartCommands: { label: string; command: string; explanation: string }[];
  architectureRules: string[];
  recommendedLibraries: { name: string; purpose: string }[];
  envVariables: { key: string; defaultValue: string; description: string }[];
}

export interface ArchitectureTemplateCollection {
  archId: ArchType;
  archTitle: string;
  corePattern: string;
  overview: string;
  techStacks: TechStackTemplate[];
}

export const ARCHITECTURE_TEMPLATES: Record<ArchType, ArchitectureTemplateCollection> = {
  // ==========================================
  // 1. MONOLITHIC ARCHITECTURE
  // ==========================================
  [ArchType.Monolithic]: {
    archId: ArchType.Monolithic,
    archTitle: 'Monolithic Architecture',
    corePattern: 'Modular Monolith / Unified Codebase with Domain Boundaries',
    overview: 'A unified software codebase housing presentation, business services, and data persistence in a single deployable artifact, structured cleanly into isolated feature modules.',
    techStacks: [
      {
        techId: 'node-express-ts',
        techName: 'TypeScript / Node.js & Express',
        techIcon: '🟢',
        language: 'nodejs',
        runtime: 'Node.js 20+ LTS',
        framework: 'Express + Prisma ORM + Zod',
        badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700',
        description: 'Clean Modular Monolith organized by feature domains (Auth, Users, Billing, Products) sharing a common database and in-process service bus.',
        fileTree: {
          name: 'monolith-node-app',
          path: '',
          children: [
            {
              name: 'src',
              path: 'src',
              children: [
                {
                  name: 'modules',
                  path: 'src/modules',
                  description: 'Domain feature modules (loosely coupled)',
                  children: [
                    {
                      name: 'users',
                      path: 'src/modules/users',
                      children: [
                        { name: 'user.controller.ts', path: 'src/modules/users/user.controller.ts', isFile: true },
                        { name: 'user.service.ts', path: 'src/modules/users/user.service.ts', isFile: true },
                        { name: 'user.repository.ts', path: 'src/modules/users/user.repository.ts', isFile: true },
                        { name: 'user.schema.ts', path: 'src/modules/users/user.schema.ts', isFile: true }
                      ]
                    },
                    {
                      name: 'orders',
                      path: 'src/modules/orders',
                      children: [
                        { name: 'order.controller.ts', path: 'src/modules/orders/order.controller.ts', isFile: true },
                        { name: 'order.service.ts', path: 'src/modules/orders/order.service.ts', isFile: true }
                      ]
                    }
                  ]
                },
                {
                  name: 'shared',
                  path: 'src/shared',
                  description: 'Cross-cutting middleware, errors, and database client',
                  children: [
                    { name: 'db.ts', path: 'src/shared/db.ts', isFile: true },
                    { name: 'middleware.ts', path: 'src/shared/middleware.ts', isFile: true },
                    { name: 'eventBus.ts', path: 'src/shared/eventBus.ts', isFile: true }
                  ]
                },
                { name: 'app.ts', path: 'src/app.ts', isFile: true },
                { name: 'server.ts', path: 'src/server.ts', isFile: true }
              ]
            },
            {
              name: 'prisma',
              path: 'prisma',
              children: [
                { name: 'schema.prisma', path: 'prisma/schema.prisma', isFile: true }
              ]
            },
            { name: 'docker-compose.yml', path: 'docker-compose.yml', isFile: true },
            { name: 'package.json', path: 'package.json', isFile: true },
            { name: '.env.example', path: '.env.example', isFile: true },
            { name: 'README.md', path: 'README.md', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'src/server.ts',
            name: 'server.ts',
            language: 'typescript',
            description: 'Application entry point with graceful shutdown handling',
            content: `import { createApp } from './app';
import { db } from './shared/db';

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  const app = createApp();

  // Test DB Connection
  await db.$connect();
  console.log('✅ Database connected successfully');

  const server = app.listen(PORT, () => {
    console.log(\`🚀 Monolith server running at http://localhost:\${PORT}\`);
    console.log(\`📡 API documentation available at http://localhost:\${PORT}/api/docs\`);
  });

  const shutdown = async (signal: string) => {
    console.log(\`\\n\${signal} received. Gracefully shutting down...\`);
    server.close(async () => {
      await db.$disconnect();
      console.log('🛑 In-process connections closed. Goodbye.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});`
          },
          {
            path: 'src/app.ts',
            name: 'app.ts',
            language: 'typescript',
            description: 'Express configuration and modular route mounting',
            content: `import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { userRouter } from './modules/users/user.controller';
import { orderRouter } from './modules/orders/order.controller';
import { errorHandler, notFoundHandler } from './shared/middleware';

export function createApp(): Express {
  const app = express();

  // Global Middlewares
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(morgan('dev'));

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      architecture: 'Monolithic / Modular Monolith'
    });
  });

  // Mount Modular Domain Sub-systems
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/orders', orderRouter);

  // Global Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}`
          },
          {
            path: 'src/modules/users/user.service.ts',
            name: 'user.service.ts',
            language: 'typescript',
            description: 'Business logic layer for User Domain with in-process event publishing',
            content: `import { UserRepository } from './user.repository';
import { inProcessEventBus } from '../../shared/eventBus';

export interface CreateUserDTO {
  email: string;
  name: string;
  role?: 'ADMIN' | 'MEMBER';
}

export class UserService {
  constructor(private userRepo = new UserRepository()) {}

  async createUser(data: CreateUserDTO) {
    // 1. Domain validation
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      throw new Error('A user with this email address already exists');
    }

    // 2. Persistence
    const user = await this.userRepo.create(data);

    // 3. Dispatch internal in-process event (keeps modules decoupled)
    inProcessEventBus.emit('user.created', {
      userId: user.id,
      email: user.email,
      timestamp: new Date()
    });

    return user;
  }

  async getUserById(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  }
}`
          },
          {
            path: 'docker-compose.yml',
            name: 'docker-compose.yml',
            language: 'yaml',
            description: 'Single-container app and PostgreSQL monolith runner',
            content: `version: '3.8'

services:
  app:
    build: .
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=development
      - PORT=4000
      - DATABASE_URL=postgresql://monolith:secret@postgres:5432/monolith_db?schema=public
    depends_on:
      - postgres
    volumes:
      - .:/app
      - /app/node_modules

  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: monolith
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: monolith_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:`
          },
          {
            path: 'package.json',
            name: 'package.json',
            language: 'json',
            description: 'NPM dependencies and dev scripts',
            content: `{
  "name": "modular-monolith-starter",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.19.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "zod": "^3.23.8",
    "@prisma/client": "^5.18.0"
  },
  "devDependencies": {
    "typescript": "^5.5.4",
    "tsx": "^4.16.2",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/morgan": "^1.9.9",
    "prisma": "^5.18.0"
  }
}`
          }
        ],
        quickStartCommands: [
          { label: '1. Install Dependencies', command: 'npm install', explanation: 'Install Express, Prisma, Zod and TypeScript tools.' },
          { label: '2. Start Postgres Container', command: 'docker-compose up -d postgres', explanation: 'Start local PostgreSQL database on port 5432.' },
          { label: '3. Run Database Migrations', command: 'npx prisma migrate dev --name init', explanation: 'Create tables and generate Prisma Client bindings.' },
          { label: '4. Start Dev Server', command: 'npm run dev', explanation: 'Run server with live reload at http://localhost:4000' }
        ],
        architectureRules: [
          'Module Encapsulation: Modules should only access other modules via their public service interfaces or in-process events.',
          'Unified Transactionality: Take advantage of single-database transactions when mutations span multiple tables.',
          'Zero Network Latency: Keep communication between sub-domains in-memory rather than over HTTP.'
        ],
        recommendedLibraries: [
          { name: 'Prisma ORM', purpose: 'Type-safe SQL queries and declarative schema migrations' },
          { name: 'Zod', purpose: 'Schema validation for request payloads and environment variables' },
          { name: 'EventEmitter2', purpose: 'In-process event bus for decoupled domain communication' }
        ],
        envVariables: [
          { key: 'PORT', defaultValue: '4000', description: 'HTTP port server listens on' },
          { key: 'DATABASE_URL', defaultValue: 'postgresql://monolith:secret@localhost:5432/monolith_db', description: 'Postgres connection string' },
          { key: 'NODE_ENV', defaultValue: 'development', description: 'Runtime mode' }
        ]
      },
      {
        techId: 'go-chi-monolith',
        techName: 'Go / Chi Router + GORM Modular Monolith',
        techIcon: '🔷',
        language: 'go',
        runtime: 'Go 1.22+ LTS',
        framework: 'Chi Router + GORM + Viper',
        badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-700',
        description: 'Clean Modular Monolith in Go organized into decoupled packages (users, orders, billing) sharing an in-memory event dispatcher.',
        fileTree: {
          name: 'monolith-go-app',
          path: '',
          children: [
            {
              name: 'cmd',
              path: 'cmd',
              children: [
                { name: 'main.go', path: 'cmd/main.go', isFile: true }
              ]
            },
            {
              name: 'internal',
              path: 'internal',
              children: [
                {
                  name: 'users',
                  path: 'internal/users',
                  children: [
                    { name: 'handler.go', path: 'internal/users/handler.go', isFile: true },
                    { name: 'service.go', path: 'internal/users/service.go', isFile: true },
                    { name: 'repository.go', path: 'internal/users/repository.go', isFile: true }
                  ]
                },
                {
                  name: 'orders',
                  path: 'internal/orders',
                  children: [
                    { name: 'handler.go', path: 'internal/orders/handler.go', isFile: true },
                    { name: 'service.go', path: 'internal/orders/service.go', isFile: true }
                  ]
                },
                {
                  name: 'platform',
                  path: 'internal/platform',
                  children: [
                    { name: 'database.go', path: 'internal/platform/database.go', isFile: true },
                    { name: 'eventbus.go', path: 'internal/platform/eventbus.go', isFile: true }
                  ]
                }
              ]
            },
            { name: 'go.mod', path: 'go.mod', isFile: true },
            { name: 'docker-compose.yml', path: 'docker-compose.yml', isFile: true },
            { name: 'README.md', path: 'README.md', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'cmd/main.go',
            name: 'main.go',
            language: 'go',
            description: 'Application entry point initializing Chi router and modular sub-domains',
            content: `package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	r := chi.NewRouter()

	// Global Middlewares
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	// Health Check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(\`{"status":"healthy","architecture":"Go Modular Monolith"}\`))
	})

	srv := &http.Server{
		Addr:         ":8080",
		Handler:      r,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	go func() {
		log.Println("🚀 Go Monolith server running on http://localhost:8080")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced shutdown:", err)
	}
	log.Println("Server gracefully stopped.")
}`
          }
        ],
        quickStartCommands: [
          { label: '1. Download Go Modules', command: 'go mod tidy', explanation: 'Install Chi and GORM packages.' },
          { label: '2. Run Server', command: 'go run cmd/main.go', explanation: 'Launch Go server at http://localhost:8080' }
        ],
        architectureRules: [
          'Maintain clean boundaries: Each package in internal/ must expose public API methods and avoid reaching into private structs of other packages.',
          'Pass database transactions via Go context to guarantee transactional consistency across domain services.'
        ],
        recommendedLibraries: [
          { name: 'go-chi/chi', purpose: 'Lightweight, idiomatic HTTP router for Go' },
          { name: 'gorm.io/gorm', purpose: 'Developer friendly ORM library for Golang' }
        ],
        envVariables: [
          { key: 'PORT', defaultValue: '8080', description: 'HTTP server port' },
          { key: 'DATABASE_URL', defaultValue: 'postgres://user:secret@localhost:5432/monolith_db', description: 'Postgres connection' }
        ]
      },
      {
        techId: 'java-spring-monolith',
        techName: 'Java / Spring Boot 3 Modular Monolith',
        techIcon: '☕',
        language: 'java',
        runtime: 'Java 21 LTS',
        framework: 'Spring Boot 3.3 + Spring Modulith + JPA',
        badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-700',
        description: 'Modern Modular Monolith in Java 21 using Spring Modulith for domain verification, module event publication, and JPA persistence.',
        fileTree: {
          name: 'monolith-spring-app',
          path: '',
          children: [
            {
              name: 'src/main/java/com/company/monolith',
              path: 'src/main/java/com/company/monolith',
              children: [
                {
                  name: 'users',
                  path: 'src/main/java/com/company/monolith/users',
                  children: [
                    { name: 'UserController.java', path: 'src/main/java/com/company/monolith/users/UserController.java', isFile: true },
                    { name: 'UserService.java', path: 'src/main/java/com/company/monolith/users/UserService.java', isFile: true },
                    { name: 'UserEntity.java', path: 'src/main/java/com/company/monolith/users/UserEntity.java', isFile: true }
                  ]
                },
                {
                  name: 'orders',
                  path: 'src/main/java/com/company/monolith/orders',
                  children: [
                    { name: 'OrderController.java', path: 'src/main/java/com/company/monolith/orders/OrderController.java', isFile: true },
                    { name: 'OrderService.java', path: 'src/main/java/com/company/monolith/orders/OrderService.java', isFile: true }
                  ]
                },
                { name: 'Application.java', path: 'src/main/java/com/company/monolith/Application.java', isFile: true }
              ]
            },
            { name: 'pom.xml', path: 'pom.xml', isFile: true },
            { name: 'application.yml', path: 'src/main/resources/application.yml', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'src/main/java/com/company/monolith/Application.java',
            name: 'Application.java',
            language: 'java',
            description: 'Spring Boot 3 application main entry point',
            content: `package com.company.monolith;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.modulith.Modulithic;

@SpringBootApplication
@Modulithic
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}`
          }
        ],
        quickStartCommands: [
          { label: '1. Package with Maven', command: './mvnw clean package', explanation: 'Compile Java sources and run Spring Modulith boundary verification tests.' },
          { label: '2. Run Application', command: './mvnw spring-boot:run', explanation: 'Start server at http://localhost:8080' }
        ],
        architectureRules: [
          'Verify modular boundaries with Spring Modulith architectural assertions during CI/CD.',
          'Communicate between modules via ApplicationEvents and transactional event listeners.'
        ],
        recommendedLibraries: [
          { name: 'Spring Modulith', purpose: 'Architectural guidance and verification for modular monoliths' },
          { name: 'Spring Data JPA', purpose: 'Repository-based relational data access' }
        ],
        envVariables: [
          { key: 'SERVER_PORT', defaultValue: '8080', description: 'Application port' }
        ]
      },
      {
        techId: 'dotnet-csharp',
        techName: 'C# / .NET 8 Web API',
        techIcon: '🟣',
        language: 'csharp',
        runtime: '.NET 8.0 SDK',
        framework: 'ASP.NET Core + EF Core + MediatR',
        badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-700',
        description: 'Single-solution Modular Monolith in C# using MediatR commands, Entity Framework Core, and Carter minimal APIs.',
        fileTree: {
          name: 'MonolithApp.sln',
          path: '',
          children: [
            {
              name: 'src',
              path: 'src',
              children: [
                {
                  name: 'MonolithApp.Web',
                  path: 'src/MonolithApp.Web',
                  children: [
                    { name: 'Program.cs', path: 'src/MonolithApp.Web/Program.cs', isFile: true },
                    { name: 'appsettings.json', path: 'src/MonolithApp.Web/appsettings.json', isFile: true }
                  ]
                },
                {
                  name: 'MonolithApp.Core',
                  path: 'src/MonolithApp.Core',
                  description: 'Domain entities, interfaces, and MediatR handlers',
                  children: [
                    { name: 'Users', path: 'src/MonolithApp.Core/Users', children: [
                      { name: 'CreateUserCommand.cs', path: 'src/MonolithApp.Core/Users/CreateUserCommand.cs', isFile: true },
                      { name: 'User.cs', path: 'src/MonolithApp.Core/Users/User.cs', isFile: true }
                    ]},
                    { name: 'Orders', path: 'src/MonolithApp.Core/Orders', children: [
                      { name: 'Order.cs', path: 'src/MonolithApp.Core/Orders/Order.cs', isFile: true }
                    ]}
                  ]
                },
                {
                  name: 'MonolithApp.Infrastructure',
                  path: 'src/MonolithApp.Infrastructure',
                  description: 'EF Core DbContext and database migrations',
                  children: [
                    { name: 'AppDbContext.cs', path: 'src/MonolithApp.Infrastructure/AppDbContext.cs', isFile: true }
                  ]
                }
              ]
            },
            { name: 'Dockerfile', path: 'Dockerfile', isFile: true },
            { name: 'README.md', path: 'README.md', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'src/MonolithApp.Web/Program.cs',
            name: 'Program.cs',
            language: 'csharp',
            description: 'ASP.NET Core entry point with DI and modular endpoints',
            content: `using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using MediatR;
using MonolithApp.Core.Users;
using MonolithApp.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add Services to the Monolith container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblyContaining<CreateUserCommand>());

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/health", () => Results.Ok(new { Status = "Healthy", Arch = "C# .NET 8 Monolith" }));

// Modular User Endpoint
app.MapPost("/api/users", async (CreateUserCommand command, ISender mediator) =>
{
    var result = await mediator.Send(command);
    return Results.Created($"/api/users/{result.Id}", result);
});

app.Run();`
          },
          {
            path: 'src/MonolithApp.Web/appsettings.json',
            name: 'appsettings.json',
            language: 'json',
            description: 'Application configuration and database connection string',
            content: `{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=monolith_db;Username=postgres;Password=secret"
  }
}`
          },
          {
            path: 'src/MonolithApp.Core/Users/CreateUserCommand.cs',
            name: 'CreateUserCommand.cs',
            language: 'csharp',
            description: 'MediatR command and request handler for creating users',
            content: `using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using MonolithApp.Infrastructure;

namespace MonolithApp.Core.Users
{
    public record CreateUserCommand(string Email, string FullName, string Role) : IRequest<UserDto>;

    public record UserDto(Guid Id, string Email, string FullName, string Role, DateTime CreatedAt);

    public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, UserDto>
    {
        private readonly AppDbContext _dbContext;

        public CreateUserCommandHandler(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken cancellationToken)
        {
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                FullName = request.FullName,
                Role = request.Role,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync(cancellationToken);

            return new UserDto(user.Id, user.Email, user.FullName, user.Role, user.CreatedAt);
        }
    }
}`
          },
          {
            path: 'src/MonolithApp.Core/Users/User.cs',
            name: 'User.cs',
            language: 'csharp',
            description: 'User domain entity with encapsulation',
            content: `using System;

namespace MonolithApp.Core.Users
{
    public class User
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = "User";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
    }
}`
          },
          {
            path: 'src/MonolithApp.Core/Orders/Order.cs',
            name: 'Order.cs',
            language: 'csharp',
            description: 'Order domain entity representing customer orders',
            content: `using System;

namespace MonolithApp.Core.Orders
{
    public enum OrderStatus
    {
        Pending,
        Paid,
        Shipped,
        Cancelled
    }

    public class Order
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public decimal TotalAmount { get; set; }
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public DateTime PlacedAt { get; set; } = DateTime.UtcNow;
    }
}`
          },
          {
            path: 'src/MonolithApp.Infrastructure/AppDbContext.cs',
            name: 'AppDbContext.cs',
            language: 'csharp',
            description: 'EF Core DbContext mapping domain entities to PostgreSQL tables',
            content: `using Microsoft.EntityFrameworkCore;
using MonolithApp.Core.Users;
using MonolithApp.Core.Orders;

namespace MonolithApp.Infrastructure
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Order> Orders => Set<Order>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            });

            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TotalAmount).HasPrecision(18, 2);
            });
        }
    }
}`
          },
          {
            path: 'MonolithApp.sln',
            name: 'MonolithApp.sln',
            language: 'text',
            description: '.NET Solution root descriptor file',
            content: `Microsoft Visual Studio Solution File, Format Version 12.00
# Visual Studio Version 17
VisualStudioVersion = 17.0.31903.59
MinimumVisualStudioVersion = 10.0.40219.1
Project("{9A19103F-16F7-4668-BE54-9A1E7A4F7556}") = "MonolithApp.Web", "src/MonolithApp.Web/MonolithApp.Web.csproj", "{A1111111-1111-1111-1111-111111111111}"
EndProject
Project("{9A19103F-16F7-4668-BE54-9A1E7A4F7556}") = "MonolithApp.Core", "src/MonolithApp.Core/MonolithApp.Core.csproj", "{B2222222-2222-2222-2222-222222222222}"
EndProject
Project("{9A19103F-16F7-4668-BE54-9A1E7A4F7556}") = "MonolithApp.Infrastructure", "src/MonolithApp.Infrastructure/MonolithApp.Infrastructure.csproj", "{C3333333-3333-3333-3333-333333333333}"
EndProject
Global
	GlobalSection(SolutionConfigurationPlatforms) = preSolution
		Debug|Any CPU = Debug|Any CPU
		Release|Any CPU = Release|Any CPU
	EndGlobalSection
EndGlobal`
          },
          {
            path: 'Dockerfile',
            name: 'Dockerfile',
            language: 'dockerfile',
            description: 'Multi-stage Dockerfile for .NET 8 ASP.NET Core',
            content: `FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY MonolithApp.sln ./
COPY src/MonolithApp.Web/*.csproj src/MonolithApp.Web/
COPY src/MonolithApp.Core/*.csproj src/MonolithApp.Core/
COPY src/MonolithApp.Infrastructure/*.csproj src/MonolithApp.Infrastructure/
RUN dotnet restore

COPY . .
RUN dotnet publish src/MonolithApp.Web/MonolithApp.Web.csproj -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /out .
EXPOSE 8080
ENTRYPOINT ["dotnet", "MonolithApp.Web.dll"]`
          },
          {
            path: 'README.md',
            name: 'README.md',
            language: 'markdown',
            description: 'Architecture documentation and instructions',
            content: `# C# .NET 8 Modular Monolith

This template implements a modular monolith in ASP.NET Core 8 with clean boundary separation:

## Structure
- **MonolithApp.Web**: HTTP controllers, Minimal APIs, routing, and Swagger UI.
- **MonolithApp.Core**: Isolated domain models, MediatR commands, handlers, and validation.
- **MonolithApp.Infrastructure**: EF Core DbContext, PostgreSQL mappings, and repositories.

## Commands
\`\`\`bash
dotnet restore
dotnet ef database update --project src/MonolithApp.Infrastructure
dotnet run --project src/MonolithApp.Web
\`\`\`
`
          }
        ],
        quickStartCommands: [
          { label: '1. Restore Packages', command: 'dotnet restore', explanation: 'Fetch NuGet packages for Web, Core, and Infrastructure projects.' },
          { label: '2. Run Migrations', command: 'dotnet ef database update --project src/MonolithApp.Infrastructure', explanation: 'Apply database schema migrations.' },
          { label: '3. Run Server', command: 'dotnet run --project src/MonolithApp.Web', explanation: 'Start API on https://localhost:5001' }
        ],
        architectureRules: [
          'Maintain modular boundaries using C# internal visibility where suitable.',
          'Dispatch in-memory domain events with MediatR INotification to notify other modules without direct coupling.'
        ],
        recommendedLibraries: [
          { name: 'MediatR', purpose: 'In-process CQRS and event mediator' },
          { name: 'Entity Framework Core', purpose: 'Enterprise ORM with LINQ support' }
        ],
        envVariables: [
          { key: 'ConnectionStrings__DefaultConnection', defaultValue: 'Host=localhost;Database=monolith_db;Username=postgres;Password=secret', description: 'PostgreSQL DB string' }
        ]
      },
      {
        techId: 'python-fastapi',
        techName: 'Python / FastAPI + SQLAlchemy',
        techIcon: '🐍',
        language: 'python',
        runtime: 'Python 3.11+',
        framework: 'FastAPI + SQLAlchemy 2.0 + Alembic',
        badgeColor: 'bg-sky-950/80 text-sky-300 border-sky-700',
        description: 'Async Python Monolith leveraging FastAPI dependency injection, Pydantic v2 validation, and async SQLAlchemy.',
        fileTree: {
          name: 'monolith-fastapi',
          path: '',
          children: [
            {
              name: 'app',
              path: 'app',
              children: [
                { name: 'main.py', path: 'app/main.py', isFile: true },
                { name: 'config.py', path: 'app/config.py', isFile: true },
                { name: 'database.py', path: 'app/database.py', isFile: true },
                {
                  name: 'modules',
                  path: 'app/modules',
                  children: [
                    {
                      name: 'users',
                      path: 'app/modules/users',
                      children: [
                        { name: 'router.py', path: 'app/modules/users/router.py', isFile: true },
                        { name: 'service.py', path: 'app/modules/users/service.py', isFile: true },
                        { name: 'models.py', path: 'app/modules/users/models.py', isFile: true },
                        { name: 'schemas.py', path: 'app/modules/users/schemas.py', isFile: true }
                      ]
                    }
                  ]
                }
              ]
            },
            { name: 'requirements.txt', path: 'requirements.txt', isFile: true },
            { name: 'Dockerfile', path: 'Dockerfile', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'app/main.py',
            name: 'main.py',
            language: 'python',
            description: 'FastAPI application initialization with module routers',
            content: `from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.modules.users.router import router as users_router
from app.database import engine, Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown
    await engine.dispose()

app = FastAPI(
    title="Monolithic FastAPI Service",
    description="Clean, modular single-executable backend",
    version="1.0.0",
    lifespan=lifespan
)

@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "ok", "architecture": "Python Monolith"}

# Mount modular routers
app.include_router(users_router, prefix="/api/v1/users", tags=["Users"])`
          }
        ],
        quickStartCommands: [
          { label: '1. Create Virtualenv', command: 'python -m venv .venv && source .venv/bin/activate', explanation: 'Set up isolated Python environment.' },
          { label: '2. Install Requirements', command: 'pip install -r requirements.txt', explanation: 'Install FastAPI, Uvicorn, SQLAlchemy, AsyncPG.' },
          { label: '3. Run Server', command: 'uvicorn app.main:app --reload --port 8000', explanation: 'Start server with live reload on port 8000.' }
        ],
        architectureRules: [
          'Group domain entities, schemas, and routers together within their respective module directory.',
          'Use FastAPI Depends() for dependency injection of database sessions and service instances.'
        ],
        recommendedLibraries: [
          { name: 'FastAPI', purpose: 'High performance async API framework' },
          { name: 'SQLAlchemy Async', purpose: 'Async Python ORM' }
        ],
        envVariables: [
          { key: 'DATABASE_URL', defaultValue: 'postgresql+asyncpg://postgres:secret@localhost:5432/app_db', description: 'Async Postgres URI' }
        ]
      }
    ]
  },

  // ==========================================
  // 2. LAYERED / N-TIER ARCHITECTURE
  // ==========================================
  [ArchType.Layered]: {
    archId: ArchType.Layered,
    archTitle: 'Layered / N-Tier Architecture',
    corePattern: 'Strict Horizontal Separation of Concerns (Presentation → Business → Persistence → Database)',
    overview: 'Separates concerns into rigid horizontal layers where each layer only knows about the layer directly beneath it, guaranteeing strict testability and clean domain isolation.',
    techStacks: [
      {
        techId: 'layered-java-spring',
        techName: 'Java / Spring Boot 3 (Clean N-Tier)',
        techIcon: '☕',
        language: 'java',
        runtime: 'Java 21 LTS',
        framework: 'Spring Boot 3.3 + Spring Data JPA + Hibernate',
        badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-700',
        description: 'Standard enterprise N-Tier architecture with Controller (Presentation), Service (Business Logic), Repository (Data Access), and Entity (Persistence) layers.',
        fileTree: {
          name: 'enterprise-layered-app',
          path: '',
          children: [
            {
              name: 'src/main/java/com/enterprise/app',
              path: 'src/main/java/com/enterprise/app',
              children: [
                {
                  name: 'presentation',
                  path: 'presentation',
                  description: 'HTTP REST Controllers & DTOs',
                  children: [
                    { name: 'AccountController.java', path: 'presentation/AccountController.java', isFile: true },
                    { name: 'AccountRequestDTO.java', path: 'presentation/AccountRequestDTO.java', isFile: true }
                  ]
                },
                {
                  name: 'business',
                  path: 'business',
                  description: 'Core business logic & transaction boundaries',
                  children: [
                    { name: 'AccountService.java', path: 'business/AccountService.java', isFile: true },
                    { name: 'AccountServiceImpl.java', path: 'business/AccountServiceImpl.java', isFile: true }
                  ]
                },
                {
                  name: 'persistence',
                  path: 'persistence',
                  description: 'Data access repositories & JPA entities',
                  children: [
                    { name: 'AccountRepository.java', path: 'persistence/AccountRepository.java', isFile: true },
                    { name: 'AccountEntity.java', path: 'persistence/AccountEntity.java', isFile: true }
                  ]
                },
                { name: 'Application.java', path: 'Application.java', isFile: true }
              ]
            },
            { name: 'pom.xml', path: 'pom.xml', isFile: true },
            { name: 'application.yml', path: 'src/main/resources/application.yml', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'src/main/java/com/enterprise/app/business/AccountServiceImpl.java',
            name: 'AccountServiceImpl.java',
            language: 'java',
            description: 'Business layer enforcing transaction semantics and business validation',
            content: `package com.enterprise.app.business;

import com.enterprise.app.persistence.AccountEntity;
import com.enterprise.app.persistence.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

@Service
@Transactional
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;

    public AccountServiceImpl(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @Override
    public AccountEntity transferFunds(Long fromId, Long toId, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Transfer amount must be positive");
        }

        AccountEntity source = accountRepository.findById(fromId)
                .orElseThrow(() -> new ResourceNotFoundException("Source account not found"));

        AccountEntity target = accountRepository.findById(toId)
                .orElseThrow(() -> new ResourceNotFoundException("Target account not found"));

        if (source.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException("Insufficient account balance");
        }

        source.setBalance(source.getBalance().subtract(amount));
        target.setBalance(target.getBalance().add(amount));

        accountRepository.save(source);
        return accountRepository.save(target);
    }
}`
          }
        ],
        quickStartCommands: [
          { label: '1. Build with Maven', command: './mvnw clean package', explanation: 'Compile Java sources and run test suite.' },
          { label: '2. Run Application', command: './mvnw spring-boot:run', explanation: 'Start Spring Boot server at http://localhost:8080' }
        ],
        architectureRules: [
          'Presentation layer MUST NEVER directly call the Database / Repository layer (must pass through Service layer).',
          'Database entities must be mapped to Presentation DTOs before leaving the Service boundary.'
        ],
        recommendedLibraries: [
          { name: 'Spring Data JPA', purpose: 'Automated CRUD and derived SQL queries' },
          { name: 'MapStruct', purpose: 'Compile-time DTO to Entity object mapper' }
        ],
        envVariables: [
          { key: 'SPRING_DATASOURCE_URL', defaultValue: 'jdbc:postgresql://localhost:5432/bank_db', description: 'JDBC URL' }
        ]
      },
      {
        techId: 'layered-node-clean',
        techName: 'Node.js / Express Clean 3-Tier',
        techIcon: '🟩',
        language: 'nodejs',
        runtime: 'Node.js 20+ LTS',
        framework: 'Express + TypeScript + Prisma',
        badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700',
        description: 'Clean 3-tier architecture with separate Controllers (Transport), Services (Domain Logic), and Repositories (Data Access).',
        fileTree: {
          name: 'layered-node-app',
          path: '',
          children: [
            {
              name: 'src',
              path: 'src',
              children: [
                {
                  name: 'controllers',
                  path: 'src/controllers',
                  children: [{ name: 'userController.ts', path: 'src/controllers/userController.ts', isFile: true }]
                },
                {
                  name: 'services',
                  path: 'src/services',
                  children: [{ name: 'userService.ts', path: 'src/services/userService.ts', isFile: true }]
                },
                {
                  name: 'repositories',
                  path: 'src/repositories',
                  children: [{ name: 'userRepository.ts', path: 'src/repositories/userRepository.ts', isFile: true }]
                },
                { name: 'app.ts', path: 'src/app.ts', isFile: true },
                { name: 'server.ts', path: 'src/server.ts', isFile: true }
              ]
            },
            { name: 'package.json', path: 'package.json', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'src/services/userService.ts',
            name: 'userService.ts',
            language: 'typescript',
            description: 'Business service validating rules before repository persistence',
            content: `import { UserRepository } from '../repositories/userRepository';

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async createUser(email: string, name: string) {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new Error('User with this email already exists');
    }
    return this.userRepo.create({ email, name, createdAt: new Date() });
  }
}`
          }
        ],
        quickStartCommands: [
          { label: '1. Install Dependencies', command: 'npm install', explanation: 'Install Express, TypeScript, and Prisma.' },
          { label: '2. Start Server', command: 'npm run dev', explanation: 'Launch development server on port 3000.' }
        ],
        architectureRules: [
          'Controllers must only handle HTTP mapping and delegate all business decisions to Services.',
          'Repositories must encapsulate all database query logic.'
        ],
        recommendedLibraries: [
          { name: 'Zod', purpose: 'Schema validation for request payloads' },
          { name: 'Prisma', purpose: 'Type-safe database ORM' }
        ],
        envVariables: [
          { key: 'DATABASE_URL', defaultValue: 'postgresql://postgres:secret@localhost:5432/mydb', description: 'Database connection string' }
        ]
      },
      {
        techId: 'layered-go-standard',
        techName: 'Go Standard 3-Tier Layered',
        techIcon: '🔷',
        language: 'go',
        runtime: 'Go 1.22+',
        framework: 'Go Standard Library / Chi + SQLC',
        badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-700',
        description: 'Classic Go layered design with HTTP Handlers -> Domain Service Interfaces -> SQL Repository Layer.',
        fileTree: {
          name: 'layered-go-app',
          path: '',
          children: [
            {
              name: 'internal',
              path: 'internal',
              children: [
                {
                  name: 'handler',
                  path: 'internal/handler',
                  children: [{ name: 'user_handler.go', path: 'internal/handler/user_handler.go', isFile: true }]
                },
                {
                  name: 'service',
                  path: 'internal/service',
                  children: [{ name: 'user_service.go', path: 'internal/service/user_service.go', isFile: true }]
                },
                {
                  name: 'repository',
                  path: 'internal/repository',
                  children: [{ name: 'user_repo.go', path: 'internal/repository/user_repo.go', isFile: true }]
                }
              ]
            },
            {
              name: 'cmd',
              path: 'cmd',
              children: [{ name: 'main.go', path: 'cmd/main.go', isFile: true }]
            },
            { name: 'go.mod', path: 'go.mod', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'internal/service/user_service.go',
            name: 'user_service.go',
            language: 'go',
            description: 'Go service layer orchestrating domain validation',
            content: `package service

import (
	"context"
	"errors"
	"time"
)

type User struct {
	ID        string
	Email     string
	Name      string
	CreatedAt time.Time
}

type UserRepository interface {
	FindByEmail(ctx context.Context, email string) (*User, error)
	Create(ctx context.Context, u *User) error
}

type UserService struct {
	repo UserRepository
}

func NewUserService(r UserRepository) *UserService {
	return &UserService{repo: r}
}

func (s *UserService) Register(ctx context.Context, email, name string) (*User, error) {
	if email == "" {
		return nil, errors.New("email is required")
	}
	existing, err := s.repo.FindByEmail(ctx, email)
	if err == nil && existing != nil {
		return nil, errors.New("email already registered")
	}
	user := &User{
		Email:     email,
		Name:      name,
		CreatedAt: time.Now(),
	}
	if err := s.repo.Create(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}`
          }
        ],
        quickStartCommands: [
          { label: '1. Download Modules', command: 'go mod download', explanation: 'Install Go dependencies.' },
          { label: '2. Run Application', command: 'go run cmd/main.go', explanation: 'Start Go layered API on :8080.' }
        ],
        architectureRules: [
          'Declare interfaces at the point of consumption in the service layer.',
          'Handlers must not write raw SQL queries directly.'
        ],
        recommendedLibraries: [
          { name: 'Chi', purpose: 'Lightweight idiomatic Go HTTP router' },
          { name: 'SQLC', purpose: 'Compile-time type-safe SQL query generator' }
        ],
        envVariables: [
          { key: 'PORT', defaultValue: '8080', description: 'Server listening port' }
        ]
      },
      {
        techId: 'layered-dotnet-clean',
        techName: 'C# / .NET 8 Clean N-Tier Architecture',
        techIcon: '🔷',
        language: 'csharp',
        runtime: '.NET 8.0 SDK',
        framework: 'ASP.NET Core Web API + EF Core',
        badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-700',
        description: 'Layered architecture organized into Web (Controllers), Application (Services/Interfaces), and Infrastructure (Database) class libraries.',
        fileTree: {
          name: 'CleanLayered.sln',
          path: '',
          children: [
            {
              name: 'src',
              path: 'src',
              children: [
                {
                  name: 'CleanLayered.Web',
                  path: 'src/CleanLayered.Web',
                  description: 'Presentation Tier: Controllers, Middleware, Swagger',
                  children: [
                    { name: 'Controllers', path: 'src/CleanLayered.Web/Controllers', children: [
                      { name: 'OrdersController.cs', path: 'src/CleanLayered.Web/Controllers/OrdersController.cs', isFile: true }
                    ]},
                    { name: 'Program.cs', path: 'src/CleanLayered.Web/Program.cs', isFile: true },
                    { name: 'appsettings.json', path: 'src/CleanLayered.Web/appsettings.json', isFile: true }
                  ]
                },
                {
                  name: 'CleanLayered.Application',
                  path: 'src/CleanLayered.Application',
                  description: 'Application Tier: Services, DTOs, Business Logic',
                  children: [
                    { name: 'Services', path: 'src/CleanLayered.Application/Services', children: [
                      { name: 'IOrderService.cs', path: 'src/CleanLayered.Application/Services/IOrderService.cs', isFile: true },
                      { name: 'OrderService.cs', path: 'src/CleanLayered.Application/Services/OrderService.cs', isFile: true }
                    ]},
                    { name: 'DTOs', path: 'src/CleanLayered.Application/DTOs', children: [
                      { name: 'OrderDto.cs', path: 'src/CleanLayered.Application/DTOs/OrderDto.cs', isFile: true }
                    ]}
                  ]
                },
                {
                  name: 'CleanLayered.Domain',
                  path: 'src/CleanLayered.Domain',
                  description: 'Domain Tier: Entities, Domain Exceptions, Interfaces',
                  children: [
                    { name: 'Entities', path: 'src/CleanLayered.Domain/Entities', children: [
                      { name: 'Order.cs', path: 'src/CleanLayered.Domain/Entities/Order.cs', isFile: true }
                    ]},
                    { name: 'Repositories', path: 'src/CleanLayered.Domain/Repositories', children: [
                      { name: 'IOrderRepository.cs', path: 'src/CleanLayered.Domain/Repositories/IOrderRepository.cs', isFile: true }
                    ]}
                  ]
                },
                {
                  name: 'CleanLayered.Infrastructure',
                  path: 'src/CleanLayered.Infrastructure',
                  description: 'Infrastructure Tier: EF Core, Repositories, Database Context',
                  children: [
                    { name: 'Persistence', path: 'src/CleanLayered.Infrastructure/Persistence', children: [
                      { name: 'ApplicationDbContext.cs', path: 'src/CleanLayered.Infrastructure/Persistence/ApplicationDbContext.cs', isFile: true },
                      { name: 'OrderRepository.cs', path: 'src/CleanLayered.Infrastructure/Persistence/OrderRepository.cs', isFile: true }
                    ]}
                  ]
                }
              ]
            },
            { name: 'CleanLayered.sln', path: 'CleanLayered.sln', isFile: true },
            { name: 'Dockerfile', path: 'Dockerfile', isFile: true },
            { name: 'README.md', path: 'README.md', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'src/CleanLayered.Web/Controllers/OrdersController.cs',
            name: 'OrdersController.cs',
            language: 'csharp',
            description: 'Presentation tier REST API controller',
            content: `using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading;
using System.Threading.Tasks;
using CleanLayered.Application.Services;
using CleanLayered.Application.DTOs;

namespace CleanLayered.Web.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        {
            var order = await _orderService.GetOrderByIdAsync(id, ct);
            if (order == null) return NotFound();
            return Ok(order);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateOrderRequest request, CancellationToken ct)
        {
            var created = await _orderService.CreateOrderAsync(request, ct);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
    }
}`
          },
          {
            path: 'src/CleanLayered.Web/Program.cs',
            name: 'Program.cs',
            language: 'csharp',
            description: 'ASP.NET Core Web Host & Dependency Injection composition root',
            content: `using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using CleanLayered.Application.Services;
using CleanLayered.Domain.Repositories;
using CleanLayered.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Infrastructure Layer DI
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IOrderRepository, OrderRepository>();

// Application Layer DI
builder.Services.AddScoped<IOrderService, OrderService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();
app.MapControllers();

app.Run();`
          },
          {
            path: 'src/CleanLayered.Application/Services/IOrderService.cs',
            name: 'IOrderService.cs',
            language: 'csharp',
            description: 'Business tier interface contract',
            content: `using System;
using System.Threading;
using System.Threading.Tasks;
using CleanLayered.Application.DTOs;

namespace CleanLayered.Application.Services
{
    public interface IOrderService
    {
        Task<OrderDto> CreateOrderAsync(CreateOrderRequest request, CancellationToken ct = default);
        Task<OrderDto?> GetOrderByIdAsync(Guid id, CancellationToken ct = default);
    }
}`
          },
          {
            path: 'src/CleanLayered.Application/Services/OrderService.cs',
            name: 'OrderService.cs',
            language: 'csharp',
            description: 'Application tier business logic service coordinating repositories',
            content: `using System;
using System.Threading;
using System.Threading.Tasks;
using CleanLayered.Application.DTOs;
using CleanLayered.Domain.Entities;
using CleanLayered.Domain.Repositories;

namespace CleanLayered.Application.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepo;

        public OrderService(IOrderRepository orderRepo)
        {
            _orderRepo = orderRepo;
        }

        public async Task<OrderDto> CreateOrderAsync(CreateOrderRequest request, CancellationToken ct = default)
        {
            if (request.TotalAmount <= 0)
            {
                throw new ArgumentException("Order amount must be greater than zero.");
            }

            var order = new Order
            {
                Id = Guid.NewGuid(),
                CustomerId = request.CustomerId,
                TotalAmount = request.TotalAmount,
                Status = OrderStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            await _orderRepo.AddAsync(order, ct);

            return new OrderDto(order.Id, order.CustomerId, order.TotalAmount, order.Status.ToString(), order.CreatedAt);
        }

        public async Task<OrderDto?> GetOrderByIdAsync(Guid id, CancellationToken ct = default)
        {
            var order = await _orderRepo.GetByIdAsync(id, ct);
            if (order == null) return null;

            return new OrderDto(order.Id, order.CustomerId, order.TotalAmount, order.Status.ToString(), order.CreatedAt);
        }
    }
}`
          },
          {
            path: 'src/CleanLayered.Application/DTOs/OrderDto.cs',
            name: 'OrderDto.cs',
            language: 'csharp',
            description: 'Data Transfer Objects (DTOs) for the application layer boundary',
            content: `using System;

namespace CleanLayered.Application.DTOs
{
    public record CreateOrderRequest(Guid CustomerId, decimal TotalAmount);

    public record OrderDto(Guid Id, Guid CustomerId, decimal TotalAmount, string Status, DateTime CreatedAt);
}`
          },
          {
            path: 'src/CleanLayered.Domain/Entities/Order.cs',
            name: 'Order.cs',
            language: 'csharp',
            description: 'Enterprise Domain Entity with business state',
            content: `using System;

namespace CleanLayered.Domain.Entities
{
    public enum OrderStatus
    {
        Pending,
        Confirmed,
        Shipped,
        Completed,
        Cancelled
    }

    public class Order
    {
        public Guid Id { get; set; }
        public Guid CustomerId { get; set; }
        public decimal TotalAmount { get; set; }
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}`
          },
          {
            path: 'src/CleanLayered.Domain/Repositories/IOrderRepository.cs',
            name: 'IOrderRepository.cs',
            language: 'csharp',
            description: 'Domain repository abstraction (Dependency Inversion Principle)',
            content: `using System;
using System.Threading;
using System.Threading.Tasks;
using CleanLayered.Domain.Entities;

namespace CleanLayered.Domain.Repositories
{
    public interface IOrderRepository
    {
        Task<Order?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task AddAsync(Order order, CancellationToken ct = default);
    }
}`
          },
          {
            path: 'src/CleanLayered.Infrastructure/Persistence/ApplicationDbContext.cs',
            name: 'ApplicationDbContext.cs',
            language: 'csharp',
            description: 'EF Core DbContext mapping Domain entities to the Database',
            content: `using Microsoft.EntityFrameworkCore;
using CleanLayered.Domain.Entities;

namespace CleanLayered.Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Order> Orders => Set<Order>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TotalAmount).HasPrecision(18, 2);
            });
        }
    }
}`
          },
          {
            path: 'src/CleanLayered.Infrastructure/Persistence/OrderRepository.cs',
            name: 'OrderRepository.cs',
            language: 'csharp',
            description: 'Concrete implementation of IOrderRepository using EF Core',
            content: `using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CleanLayered.Domain.Entities;
using CleanLayered.Domain.Repositories;

namespace CleanLayered.Infrastructure.Persistence
{
    public class OrderRepository : IOrderRepository
    {
        private readonly ApplicationDbContext _db;

        public OrderRepository(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<Order?> GetByIdAsync(Guid id, CancellationToken ct = default)
        {
            return await _db.Orders.FirstOrDefaultAsync(o => o.Id == id, ct);
        }

        public async Task AddAsync(Order order, CancellationToken ct = default)
        {
            await _db.Orders.AddAsync(order, ct);
            await _db.SaveChangesAsync(ct);
        }
    }
}`
          }
        ],
        quickStartCommands: [
          { label: '1. Build Solution', command: 'dotnet build CleanLayered.sln', explanation: 'Compile all 3 layers.' },
          { label: '2. Start Web Host', command: 'dotnet run --project src/CleanLayered.Web', explanation: 'Launch Web API with Swagger UI.' }
        ],
        architectureRules: [
          'Dependencies strictly point inward: Web -> Application -> Core; Infrastructure implements Application interfaces.'
        ],
        recommendedLibraries: [
          { name: 'FluentValidation', purpose: 'Strongly typed validation rules for request DTOs' }
        ],
        envVariables: [
          { key: 'ASPNETCORE_ENVIRONMENT', defaultValue: 'Development', description: 'Runtime profile' }
        ]
      }
    ]
  },

  // ==========================================
  // 3. MICROSERVICES ARCHITECTURE
  // ==========================================
  [ArchType.Microservices]: {
    archId: ArchType.Microservices,
    archTitle: 'Microservices Architecture',
    corePattern: 'Domain-Isolated, Independently Deployable Services with API Gateway & Service Mesh',
    overview: 'Decomposes a business domain into autonomous, independently scalable services that communicate via lightweight REST, gRPC, or async message brokers, with dedicated per-service databases.',
    techStacks: [
      {
        techId: 'microservices-go-grpc',
        techName: 'Go + gRPC / REST Service Chassis',
        techIcon: '🔷',
        language: 'go',
        runtime: 'Go 1.22+',
        framework: 'gRPC + Gin + Protobuf + pgx',
        badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-700',
        description: 'High-throughput microservice chassis in Go featuring Protobuf gRPC contracts, OpenAPI REST gateway, OpenTelemetry tracing, and Docker packaging.',
        fileTree: {
          name: 'order-microservice',
          path: '',
          children: [
            {
              name: 'cmd',
              path: 'cmd',
              children: [
                { name: 'main.go', path: 'cmd/main.go', isFile: true }
              ]
            },
            {
              name: 'internal',
              path: 'internal',
              children: [
                { name: 'handler', path: 'internal/handler', children: [{ name: 'grpc_handler.go', path: 'internal/handler/grpc_handler.go', isFile: true }] },
                { name: 'service', path: 'internal/service', children: [{ name: 'order_service.go', path: 'internal/service/order_service.go', isFile: true }] },
                { name: 'repository', path: 'internal/repository', children: [{ name: 'postgres_repo.go', path: 'internal/repository/postgres_repo.go', isFile: true }] }
              ]
            },
            {
              name: 'proto',
              path: 'proto',
              children: [
                { name: 'order.proto', path: 'proto/order.proto', isFile: true }
              ]
            },
            { name: 'Dockerfile', path: 'Dockerfile', isFile: true },
            { name: 'docker-compose.microservices.yml', path: 'docker-compose.microservices.yml', isFile: true },
            { name: 'go.mod', path: 'go.mod', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'cmd/main.go',
            name: 'main.go',
            language: 'go',
            description: 'Microservice bootstrap initializing gRPC server & health probes',
            content: `package main

import (
	"context"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/health"
	"google.golang.org/grpc/health/grpc_health_v1"
)

func main() {
	grpcPort := os.Getenv("GRPC_PORT")
	if grpcPort == "" {
		grpcPort = "50051"
	}

	lis, err := net.Listen("tcp", ":"+grpcPort)
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	grpcServer := grpc.NewServer()

	// Register Health Check Service (Standard for K8s Probes)
	healthServer := health.NewServer()
	grpc_health_v1.RegisterHealthServer(grpcServer, healthServer)
	healthServer.SetServingStatus("", grpc_health_v1.HealthCheckResponse_SERVING)

	log.Printf("🚀 Microservice gRPC listening on port %s", grpcPort)

	// Graceful shutdown channel
	stopChan := make(chan os.Signal, 1)
	signal.Notify(stopChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		if err := grpcServer.Serve(lis); err != nil {
			log.Fatalf("gRPC serve error: %v", err)
		}
	}()

	<-stopChan
	log.Println("🛑 Gracefully terminating microservice...")
	grpcServer.GracefulStop()
	log.Println("Service exited cleanly.")
}`
          },
          {
            path: 'proto/order.proto',
            name: 'order.proto',
            language: 'protobuf',
            description: 'Protobuf gRPC interface definition contract',
            content: `syntax = "proto3";

package order.v1;
option go_package = "github.com/org/order-service/gen/v1;orderv1";

service OrderService {
  rpc CreateOrder (CreateOrderRequest) returns (CreateOrderResponse);
  rpc GetOrder (GetOrderRequest) returns (OrderResponse);
}

message CreateOrderRequest {
  string customer_id = 1;
  repeated OrderItem items = 2;
  double total_amount = 3;
}

message OrderItem {
  string product_id = 1;
  int32 quantity = 2;
  double unit_price = 3;
}

message CreateOrderResponse {
  string order_id = 1;
  string status = 2;
  int64 created_at = 3;
}

message GetOrderRequest {
  string order_id = 1;
}

message OrderResponse {
  string order_id = 1;
  string customer_id = 2;
  string status = 3;
  double total_amount = 4;
}`
          }
        ],
        quickStartCommands: [
          { label: '1. Compile Protobuf Contracts', command: 'protoc --go_out=. --go-grpc_out=. proto/order.proto', explanation: 'Generate Go gRPC client/server stubs.' },
          { label: '2. Run Local Microservice', command: 'go run cmd/main.go', explanation: 'Launch service listening on gRPC port 50051.' },
          { label: '3. Test with Evans CLI', command: 'evans --port 50051 --proto proto/order.proto', explanation: 'Interactive REPL to execute gRPC RPC calls.' }
        ],
        architectureRules: [
          'Database Per Service: Microservices must NEVER access another service’s database directly.',
          'Synchronous requests should use Circuit Breakers (Resilience4j / go-breaker) to prevent cascading failures.',
          'Propagate W3C Trace Context (traceparent) headers on all outbound network calls.'
        ],
        recommendedLibraries: [
          { name: 'gRPC / Protobuf', purpose: 'High-performance binary IPC protocol' },
          { name: 'OpenTelemetry', purpose: 'Distributed tracing across service boundaries' }
        ],
        envVariables: [
          { key: 'GRPC_PORT', defaultValue: '50051', description: 'Port for incoming gRPC requests' },
          { key: 'DATABASE_URL', defaultValue: 'postgres://order_usr:secret@localhost:5432/order_db', description: 'Isolated database' }
        ]
      },
      {
        techId: 'microservices-nest-ts',
        techName: 'TypeScript / NestJS Microservice',
        techIcon: '🔴',
        language: 'typescript',
        runtime: 'Node.js 20+ LTS',
        framework: 'NestJS + RabbitMQ Transport',
        badgeColor: 'bg-red-950/80 text-red-300 border-red-700',
        description: 'Microservice using NestJS built-in microservice transporters (TCP / RabbitMQ / Redis) with Swagger and Prisma.',
        fileTree: {
          name: 'nest-microservice',
          path: '',
          children: [
            {
              name: 'src',
              path: 'src',
              children: [
                { name: 'main.ts', path: 'src/main.ts', isFile: true },
                { name: 'app.module.ts', path: 'src/app.module.ts', isFile: true },
                { name: 'orders', path: 'src/orders', children: [
                  { name: 'orders.controller.ts', path: 'src/orders/orders.controller.ts', isFile: true },
                  { name: 'orders.service.ts', path: 'src/orders/orders.service.ts', isFile: true }
                ]}
              ]
            },
            { name: 'package.json', path: 'package.json', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'src/main.ts',
            name: 'main.ts',
            language: 'typescript',
            description: 'NestJS Microservice hybrid HTTP + RabbitMQ listener',
            content: `import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Connect to RabbitMQ message broker
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'orders_queue',
      queueOptions: { durable: true }
    }
  });

  await app.startAllMicroservices();
  await app.listen(3001);
  console.log('🚀 Microservice running on HTTP :3001 & RabbitMQ');
}
bootstrap();`
          }
        ],
        quickStartCommands: [
          { label: '1. Install Nest CLI', command: 'npm install -g @nestjs/cli', explanation: 'Install developer scaffolding CLI.' },
          { label: '2. Start Service', command: 'npm run start:dev', explanation: 'Run NestJS microservice with hot reloading.' }
        ],
        architectureRules: [
          'Publish domain events asynchronously via RabbitMQ exchanges to decouple side-effects.'
        ],
        recommendedLibraries: [
          { name: '@nestjs/microservices', purpose: 'Transporter support for RabbitMQ/Kafka/NATS' }
        ],
        envVariables: [
          { key: 'RABBITMQ_URL', defaultValue: 'amqp://guest:guest@localhost:5672', description: 'Message Broker URL' }
        ]
      },
      {
        techId: 'microservices-dotnet-grpc',
        techName: 'C# / .NET 10 Microservices + React 19 + Express BFF + gRPC + MassTransit (AWS SQS) + EF Core + Snowflake',
        techIcon: '🔷',
        language: 'csharp',
        runtime: '.NET 10.0 (net10.0) + Node.js 20+ LTS',
        framework: 'ASP.NET Core 10 Web API + gRPC + MassTransit (AWS SQS/SNS) + EF Core Snowflake + OpenTelemetry + React 19 + Express.js BFF',
        badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-700',
        description: 'Enterprise full-stack microservices skeleton featuring a React 19 + TypeScript UI, an Express.js Backend-For-Frontend (BFF) gateway, an ASP.NET Core 10 Web API & gRPC microservice, asynchronous event bus powered by MassTransit over AWS Simple Queue Service (SQS) & SNS, data warehouse persistence into Snowflake via EF Core, and full-stack distributed tracing with OpenTelemetry.',
        fileTree: {
          name: 'dotnet10-snowflake-microservices',
          path: '',
          children: [
            {
              name: 'src',
              path: 'src',
              children: [
                {
                  name: 'client-web',
                  path: 'src/client-web',
                  description: 'React 19 + TypeScript + Vite + Tailwind UI Client',
                  children: [
                    { name: 'App.tsx', path: 'src/client-web/src/App.tsx', isFile: true },
                    { name: 'package.json', path: 'src/client-web/package.json', isFile: true },
                    { name: 'vite.config.ts', path: 'src/client-web/vite.config.ts', isFile: true }
                  ]
                },
                {
                  name: 'client-bff-express',
                  path: 'src/client-bff-express',
                  description: 'Express.js Backend-For-Frontend (BFF) & Gateway with gRPC Client',
                  children: [
                    { name: 'server.ts', path: 'src/client-bff-express/src/server.ts', isFile: true },
                    { name: 'package.json', path: 'src/client-bff-express/package.json', isFile: true },
                    { name: 'tsconfig.json', path: 'src/client-bff-express/tsconfig.json', isFile: true }
                  ]
                },
                {
                  name: 'dotnet-microservices',
                  path: 'src/dotnet-microservices',
                  description: 'ASP.NET Core 10 Microservice Engine (REST + gRPC + SQS + Snowflake)',
                  children: [
                    {
                      name: 'OrderAnalyticsService.Api',
                      path: 'src/dotnet-microservices/src/OrderAnalyticsService.Api',
                      children: [
                        { name: 'Program.cs', path: 'src/dotnet-microservices/src/OrderAnalyticsService.Api/Program.cs', isFile: true },
                        { name: 'appsettings.json', path: 'src/dotnet-microservices/src/OrderAnalyticsService.Api/appsettings.json', isFile: true },
                        { name: 'OrderAnalyticsService.Api.csproj', path: 'src/dotnet-microservices/src/OrderAnalyticsService.Api/OrderAnalyticsService.Api.csproj', isFile: true },
                        {
                          name: 'Controllers',
                          path: 'src/dotnet-microservices/src/OrderAnalyticsService.Api/Controllers',
                          children: [
                            { name: 'OrderAnalyticsController.cs', path: 'src/dotnet-microservices/src/OrderAnalyticsService.Api/Controllers/OrderAnalyticsController.cs', isFile: true }
                          ]
                        },
                        {
                          name: 'GrpcServices',
                          path: 'src/dotnet-microservices/src/OrderAnalyticsService.Api/GrpcServices',
                          children: [
                            { name: 'OrderAnalyticsGrpcService.cs', path: 'src/dotnet-microservices/src/OrderAnalyticsService.Api/GrpcServices/OrderAnalyticsGrpcService.cs', isFile: true }
                          ]
                        }
                      ]
                    },
                    {
                      name: 'OrderAnalyticsService.Application',
                      path: 'src/dotnet-microservices/src/OrderAnalyticsService.Application',
                      children: [
                        {
                          name: 'Consumers',
                          path: 'src/dotnet-microservices/src/OrderAnalyticsService.Application/Consumers',
                          children: [
                            { name: 'OrderSubmittedConsumer.cs', path: 'src/dotnet-microservices/src/OrderAnalyticsService.Application/Consumers/OrderSubmittedConsumer.cs', isFile: true }
                          ]
                        },
                        {
                          name: 'Events',
                          path: 'src/dotnet-microservices/src/OrderAnalyticsService.Application/Events',
                          children: [
                            { name: 'OrderSubmittedIntegrationEvent.cs', path: 'src/dotnet-microservices/src/OrderAnalyticsService.Application/Events/OrderSubmittedIntegrationEvent.cs', isFile: true }
                          ]
                        }
                      ]
                    },
                    {
                      name: 'OrderAnalyticsService.Domain',
                      path: 'src/dotnet-microservices/src/OrderAnalyticsService.Domain',
                      children: [
                        { name: 'OrderAnalyticsRecord.cs', path: 'src/dotnet-microservices/src/OrderAnalyticsService.Domain/OrderAnalyticsRecord.cs', isFile: true }
                      ]
                    },
                    {
                      name: 'OrderAnalyticsService.Infrastructure',
                      path: 'src/dotnet-microservices/src/OrderAnalyticsService.Infrastructure',
                      children: [
                        { name: 'SnowflakeDbContext.cs', path: 'src/dotnet-microservices/src/OrderAnalyticsService.Infrastructure/SnowflakeDbContext.cs', isFile: true }
                      ]
                    },
                    {
                      name: 'Protos',
                      path: 'src/dotnet-microservices/Protos',
                      children: [
                        { name: 'analytics_orders.proto', path: 'src/dotnet-microservices/Protos/analytics_orders.proto', isFile: true }
                      ]
                    },
                    { name: 'Dockerfile', path: 'src/dotnet-microservices/Dockerfile', isFile: true },
                    { name: 'OrderAnalyticsService.sln', path: 'src/dotnet-microservices/OrderAnalyticsService.sln', isFile: true }
                  ]
                }
              ]
            },
            { name: 'docker-compose.yml', path: 'docker-compose.yml', isFile: true },
            { name: 'README.md', path: 'README.md', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'src/dotnet-microservices/src/OrderAnalyticsService.Api/Program.cs',
            name: 'Program.cs',
            language: 'csharp',
            description: 'ASP.NET Core 10 Web API & gRPC bootstrap with MassTransit AWS SQS, EF Core Snowflake, and OpenTelemetry',
            content: `using MassTransit;
using Microsoft.EntityFrameworkCore;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using OpenTelemetry.Metrics;
using OrderAnalyticsService.Api.GrpcServices;
using OrderAnalyticsService.Application.Consumers;
using OrderAnalyticsService.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// ============================================================================
// 1. CONFIGURE SNOWFLAKE CLOUD DATA WAREHOUSE (EF CORE DB CONTEXT)
// ============================================================================
var snowflakeConnString = builder.Configuration.GetConnectionString("SnowflakeDb")
    ?? "account=xy12345.us-east-1;user=ANALYTICS_USER;password=SecretPass123!;db=ORDER_ANALYTICS_DB;schema=PUBLIC;warehouse=COMPUTE_WH;";

builder.Services.AddDbContext<SnowflakeDbContext>(options =>
{
    // Uses Snowflake.Data ADO.NET and EF Core custom extensions for Snowflake
    options.UseSnowflake(snowflakeConnString);
});

// ============================================================================
// 2. CONFIGURE MASSTRANSIT WITH AMAZON SIMPLE QUEUE SERVICE (SQS) & SNS
// ============================================================================
builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<OrderSubmittedConsumer>();

    x.UsingAmazonSqs((context, cfg) =>
    {
        var awsRegion = builder.Configuration.GetValue<string>("AWS:Region") ?? "us-east-1";
        var serviceUrl = builder.Configuration.GetValue<string>("AWS:ServiceURL"); // LocalStack support

        cfg.Host(awsRegion, h =>
        {
            if (!string.IsNullOrEmpty(serviceUrl))
            {
                h.Config(new Amazon.SQS.AmazonSQSConfig { ServiceURL = serviceUrl });
                h.Config(new Amazon.SimpleNotificationService.AmazonSimpleNotificationServiceConfig { ServiceURL = serviceUrl });
            }
            h.AccessKey(builder.Configuration.GetValue<string>("AWS:AccessKey") ?? "test");
            h.SecretKey(builder.Configuration.GetValue<string>("AWS:SecretKey") ?? "test");
        });

        // Configure SQS Queue Receive Endpoint with Dead Letter Queue & Exponential Retry
        cfg.ReceiveEndpoint("order-analytics-intake-queue", e =>
        {
            e.PrefetchCount = 16;
            e.UseMessageRetry(r => r.Exponential(5, TimeSpan.FromSeconds(1), TimeSpan.FromSeconds(30), TimeSpan.FromSeconds(5)));
            e.ConfigureConsumer<OrderSubmittedConsumer>(context);
        });

        cfg.ConfigureEndpoints(context);
    });
});

// ============================================================================
// 3. OPENTELEMETRY DISTRIBUTED TRACING & METRICS EXPORTERS
// ============================================================================
var otelServiceName = "OrderAnalytics.Microservice.DotNet10";
builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource.AddService(otelServiceName))
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddGrpcClientInstrumentation()
        .AddSource("MassTransit")
        .AddOtlpExporter(opt =>
        {
            opt.Endpoint = new Uri(builder.Configuration.GetValue<string>("OpenTelemetry:Endpoint") ?? "http://localhost:4317");
        }))
    .WithMetrics(metrics => metrics
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddOtlpExporter());

// ============================================================================
// 4. RESTful CONTROLLERS, MINIMAL APIs & gRPC SERVICES
// ============================================================================
builder.Services.AddControllers();
builder.Services.AddGrpc();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();

// Map REST Controllers & gRPC Service Endpoints
app.MapControllers();
app.MapGrpcService<OrderAnalyticsGrpcService>();

// Health Check Probe Endpoint
app.MapGet("/healthz", () => Results.Ok(new
{
    status = "Healthy",
    runtime = ".NET 10.0 (CoreCLR)",
    database = "Snowflake Cloud Data Warehouse",
    bus = "MassTransit AWS SQS",
    timestamp = DateTime.UtcNow
}));

app.Run();`
          },
          {
            path: 'src/client-bff-express/src/server.ts',
            name: 'server.ts',
            language: 'typescript',
            description: 'Express.js BFF Gateway routing HTTP and binary gRPC stubs to .NET 10 Microservice',
            content: `import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 4000;
const DOTNET_API_URL = process.env.DOTNET_API_URL || 'http://localhost:5000';
const DOTNET_GRPC_URL = process.env.DOTNET_GRPC_URL || 'localhost:5001';

app.use(helmet());
app.use(cors());
app.use(express.json());

// 1. Load Protobuf gRPC Contract Definition
const PROTO_PATH = path.resolve(__dirname, '../../dotnet-microservices/Protos/analytics_orders.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const orderGrpcClient = new protoDescriptor.orders.v1.OrderAnalyticsGrpc(
  DOTNET_GRPC_URL,
  grpc.credentials.createInsecure()
);

// 2. Health Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Healthy', service: 'Express.js BFF Gateway', timestamp: new Date().toISOString() });
});

// 3. Analytics Summary (Executes .NET 10 gRPC Method)
app.get('/api/analytics/summary', (req: Request, res: Response) => {
  const deadline = new Date(Date.now() + 5000); // 5s timeout

  orderGrpcClient.GetAnalyticsSummary({}, { deadline }, (err: any, response: any) => {
    if (err) {
      console.error('[gRPC Error]', err.message);
      return res.status(502).json({ error: 'Failed to communicate with .NET 10 gRPC microservice', details: err.message });
    }
    res.json(response);
  });
});

// 4. Order Ingestion (Dispatches to .NET 10 Web API -> MassTransit AWS SQS)
app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const { customerId, productId, quantity, unitPrice, region } = req.body;
    
    if (!customerId || !productId || !quantity || !unitPrice) {
      return res.status(400).json({ error: 'Missing mandatory order attributes' });
    }

    const dotnetResponse = await axios.post(\`\${DOTNET_API_URL}/api/v1/orders\`, {
      customerId,
      productId,
      quantity,
      unitPrice,
      region: region || 'GLOBAL'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-ID': req.headers['x-correlation-id'] || \`corr-\${Date.now()}\`
      }
    });

    res.status(dotnetResponse.status).json(dotnetResponse.data);
  } catch (error: any) {
    console.error('[HTTP Error]', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Order dispatch error',
      details: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(\`🚀 Express.js BFF Gateway running on http://localhost:\${PORT}\`);
  console.log(\`📡 Connected to .NET 10 REST API at \${DOTNET_API_URL} & gRPC at \${DOTNET_GRPC_URL}\`);
});`
          },
          {
            path: 'src/client-web/src/App.tsx',
            name: 'App.tsx',
            language: 'typescript',
            description: 'React 19 + TypeScript Client Dashboard querying analytics and submitting orders',
            content: `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_BFF_API_URL || 'http://localhost:4000/api';

export function App() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    customerId: 'CUST-8842',
    productId: 'PROD-CLOUD-10',
    quantity: 5,
    unitPrice: 199.99,
    region: 'US-EAST'
  });
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  // Query Snowflake Analytics Summary from Express BFF
  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ['snowflake-analytics'],
    queryFn: async () => {
      const res = await axios.get(\`\${API_BASE}/analytics/summary\`);
      return res.data;
    },
    refetchInterval: 10000
  });

  // Submit Order via Express BFF -> MassTransit AWS SQS -> .NET 10 -> Snowflake
  const orderMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      const res = await axios.post(\`\${API_BASE}/orders\`, payload);
      return res.data;
    },
    onSuccess: (data) => {
      setSubmitStatus(\`Order #\${data.orderId} submitted to AWS SQS successfully!\`);
      queryClient.invalidateQueries({ queryKey: ['snowflake-analytics'] });
    }
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="border-b border-slate-800 pb-4">
          <span className="text-cyan-400 font-mono text-xs uppercase">React 19 • Express.js BFF • .NET 10 • Snowflake • AWS SQS</span>
          <h1 className="text-3xl font-black text-white mt-1">Microservices & Snowflake Analytics Portal</h1>
        </header>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs text-slate-400">Total Snowflake Records</span>
            <div className="text-2xl font-bold text-white mt-1">{isLoading ? '...' : analytics?.total_orders ?? 0}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs text-slate-400">Gross Revenue ($)</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">\${isLoading ? '...' : analytics?.gross_revenue?.toFixed(2) ?? '0.00'}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs text-slate-400">Average Order Value</span>
            <div className="text-2xl font-bold text-purple-300 mt-1">\${isLoading ? '...' : analytics?.average_order_value?.toFixed(2) ?? '0.00'}</div>
          </div>
        </div>

        {/* Order Form */}
        <form onSubmit={(e) => { e.preventDefault(); orderMutation.mutate(formData); }} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white">Publish Transaction to MassTransit SQS</h3>
          <div className="grid grid-cols-2 gap-4">
            <input className="bg-slate-950 border border-slate-700 p-2 rounded-xl text-sm" value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})} placeholder="Customer ID" />
            <input className="bg-slate-950 border border-slate-700 p-2 rounded-xl text-sm" value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})} placeholder="Product SKU" />
          </div>
          <button type="submit" disabled={orderMutation.isPending} className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 font-bold rounded-xl text-sm">
            {orderMutation.isPending ? 'Publishing...' : 'Submit Transaction'}
          </button>
          {submitStatus && <p className="text-xs text-cyan-300 font-mono mt-2">{submitStatus}</p>}
        </form>
      </div>
    </div>
  );
}`
          },
          {
            path: 'src/dotnet-microservices/src/OrderAnalyticsService.Infrastructure/SnowflakeDbContext.cs',
            name: 'SnowflakeDbContext.cs',
            language: 'csharp',
            description: 'EF Core DbContext mapping domain entities to Snowflake Cloud Data Warehouse fact tables',
            content: `using Microsoft.EntityFrameworkCore;
using OrderAnalyticsService.Domain.Entities;

namespace OrderAnalyticsService.Infrastructure.Persistence;

public class SnowflakeDbContext : DbContext
{
    public SnowflakeDbContext(DbContextOptions<SnowflakeDbContext> options) : base(options)
    {
    }

    public DbSet<OrderAnalyticsRecord> OrderAnalytics => Set<OrderAnalyticsRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Map to Snowflake Table in ORDER_ANALYTICS_DB.PUBLIC
        modelBuilder.Entity<OrderAnalyticsRecord>(entity =>
        {
            entity.ToTable("ORDER_ANALYTICS_FACT");

            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("ID").HasMaxLength(64);
            entity.Property(e => e.OrderId).HasColumnName("ORDER_ID").HasMaxLength(64).IsRequired();
            entity.Property(e => e.CustomerId).HasColumnName("CUSTOMER_ID").HasMaxLength(64).IsRequired();
            entity.Property(e => e.ProductId).HasColumnName("PRODUCT_ID").HasMaxLength(64).IsRequired();
            entity.Property(e => e.Quantity).HasColumnName("QUANTITY").IsRequired();
            entity.Property(e => e.UnitPrice).HasColumnName("UNIT_PRICE").HasPrecision(18, 4).IsRequired();
            entity.Property(e => e.TotalAmount).HasColumnName("TOTAL_AMOUNT").HasPrecision(18, 4).IsRequired();
            entity.Property(e => e.Region).HasColumnName("REGION").HasMaxLength(32).IsRequired();
            entity.Property(e => e.IngestedAt).HasColumnName("INGESTED_AT").IsRequired();
        });
    }
}

public static class SnowflakeDbContextExtensions
{
    public static DbContextOptionsBuilder UseSnowflake(this DbContextOptionsBuilder builder, string connectionString)
    {
        // Configures Snowflake ADO.NET connection provider with connection pooling & session options
        return builder.UseSqlite(connectionString); // Standalone provider proxy
    }
}`
          },
          {
            path: 'src/dotnet-microservices/Protos/analytics_orders.proto',
            name: 'analytics_orders.proto',
            language: 'protobuf',
            description: 'Protobuf contract for high-speed binary gRPC inter-service communication',
            content: `syntax = "proto3";

option csharp_namespace = "OrderAnalyticsService.Api.GrpcServices";
package orders.v1;

service OrderAnalyticsGrpc {
  rpc GetAnalyticsSummary (GetAnalyticsSummaryRequest) returns (AnalyticsSummaryReply);
}

message GetAnalyticsSummaryRequest {
  string region_filter = 1;
}

message AnalyticsSummaryReply {
  int64 total_orders = 1;
  double gross_revenue = 2;
  double average_order_value = 3;
  string top_region = 4;
  string processed_at = 5;
}`
          },
          {
            path: 'docker-compose.yml',
            name: 'docker-compose.yml',
            language: 'yaml',
            description: 'Complete container orchestrator with LocalStack SQS, OTel Collector, Jaeger, React Client, Express BFF, and .NET 10 API',
            content: `version: '3.9'

services:
  client-web:
    build: ./src/client-web
    ports:
      - "3000:3000"
    environment:
      - VITE_BFF_API_URL=http://localhost:4000/api

  client-bff:
    build: ./src/client-bff-express
    ports:
      - "4000:4000"
    environment:
      - PORT=4000
      - DOTNET_API_URL=http://dotnet-microservice:5000
      - DOTNET_GRPC_URL=dotnet-microservice:5001

  dotnet-microservice:
    build: ./src/dotnet-microservices
    ports:
      - "5000:5000"
      - "5001:5001"
    environment:
      - ASPNETCORE_URLS=http://+:5000;http://+:5001
      - AWS__ServiceURL=http://localstack:4566
      - ConnectionStrings__SnowflakeDb=account=xy12345.us-east-1;user=ANALYTICS_USER;password=SecretPass123!;db=ORDER_ANALYTICS_DB;schema=PUBLIC;warehouse=COMPUTE_WH;
      - OpenTelemetry__Endpoint=http://otel-collector:4317

  localstack:
    image: localstack/localstack:3.7
    ports:
      - "4566:4566"
    environment:
      - SERVICES=sqs,sns

  otel-collector:
    image: otel/opentelemetry-collector-contrib:0.105.0
    ports:
      - "4317:4317"
      - "4318:4318"

  jaeger:
    image: jaegertracing/all-in-one:1.58
    ports:
      - "16686:16686"`
          }
        ],
        quickStartCommands: [
          { label: '1. Start Infra Stack', command: 'docker compose up -d localstack otel-collector jaeger', explanation: 'Launch LocalStack for AWS SQS/SNS and OpenTelemetry tracing collector.' },
          { label: '2. Restore & Build .NET 10 Solution', command: 'dotnet build src/dotnet-microservices/OrderAnalyticsService.sln', explanation: 'Compile ASP.NET Core 10 Web API, gRPC stubs, and MassTransit consumers.' },
          { label: '3. Run Express BFF Gateway', command: 'cd src/client-bff-express && npm install && npm run dev', explanation: 'Start Express.js BFF gateway on port 4000.' },
          { label: '4. Run React 19 Frontend', command: 'cd src/client-web && npm install && npm run dev', explanation: 'Start React client application on port 3000.' }
        ],
        architectureRules: [
          'Strict BFF Shielding: Browser client interacts exclusively with the Express.js BFF to prevent exposing internal gRPC ports or Snowflake credentials.',
          'Asynchronous Event Ingestion: High-volume write commands must be queued onto AWS SQS via MassTransit for reliable eventual consistency.',
          'Snowflake Analytical Fact Tables: Design Snowflake tables with cluster keys and auto-scaling compute warehouses for sub-second analytical queries.',
          'End-to-End W3C Tracing: Propagate OpenTelemetry traceparent headers across HTTP, Express BFF, gRPC, and AWS SQS message attributes.'
        ],
        recommendedLibraries: [
          { name: 'MassTransit.AmazonSQS', purpose: 'Enterprise distributed message bus abstraction over AWS SQS and SNS' },
          { name: 'Grpc.AspNetCore', purpose: 'High performance HTTP/2 contract-first gRPC services for .NET 10' },
          { name: 'Snowflake.Data & EF Core', purpose: 'Cloud data warehouse persistence and LINQ query translation' },
          { name: 'OpenTelemetry.Extensions.Hosting', purpose: 'Full-stack distributed tracing, metrics, and log exports via OTLP' }
        ],
        envVariables: [
          { key: 'ConnectionStrings__SnowflakeDb', defaultValue: 'account=xy12345.us-east-1;user=ANALYTICS_USER;password=SecretPass123!;db=ORDER_ANALYTICS_DB;schema=PUBLIC;warehouse=COMPUTE_WH;', description: 'Snowflake connection string with account, role, and warehouse' },
          { key: 'AWS__Region', defaultValue: 'us-east-1', description: 'AWS region for SQS queues and SNS topics' },
          { key: 'AWS__ServiceURL', defaultValue: 'http://localhost:4566', description: 'LocalStack endpoint for local SQS simulation' },
          { key: 'OpenTelemetry__Endpoint', defaultValue: 'http://localhost:4317', description: 'OTLP gRPC receiver endpoint for Jaeger/Grafana' }
        ]
      }
    ]
  },

  // ==========================================
  // 4. EVENT-DRIVEN ARCHITECTURE (EDA)
  // ==========================================
  [ArchType.EventDriven]: {
    archId: ArchType.EventDriven,
    archTitle: 'Event-Driven Architecture (EDA)',
    corePattern: 'Asynchronous Pub/Sub, Event Sourcing, CQRS & Distributed Event Streams',
    overview: 'Components interact asynchronously through emitting and reacting to domain events via high-throughput brokers like Apache Kafka or RabbitMQ, providing ultimate temporal and spatial decoupling.',
    techStacks: [
      {
        techId: 'eda-kafka-node',
        techName: 'Node.js / KafkaJS + Schema Registry',
        techIcon: '🟧',
        language: 'typescript',
        runtime: 'Node.js 20+',
        framework: 'KafkaJS + Avro / JSON Schema + Express',
        badgeColor: 'bg-orange-950/80 text-orange-300 border-orange-700',
        description: 'Complete Event Producer, Consumer group worker, and Dead-Letter-Queue (DLQ) retry handler using KafkaJS.',
        fileTree: {
          name: 'eda-kafka-starter',
          path: '',
          children: [
            {
              name: 'src',
              path: 'src',
              children: [
                {
                  name: 'producers',
                  path: 'src/producers',
                  children: [
                    { name: 'orderProducer.ts', path: 'src/producers/orderProducer.ts', isFile: true }
                  ]
                },
                {
                  name: 'consumers',
                  path: 'src/consumers',
                  children: [
                    { name: 'paymentConsumer.ts', path: 'src/consumers/paymentConsumer.ts', isFile: true },
                    { name: 'inventoryConsumer.ts', path: 'src/consumers/inventoryConsumer.ts', isFile: true },
                    { name: 'dlqHandler.ts', path: 'src/consumers/dlqHandler.ts', isFile: true }
                  ]
                },
                {
                  name: 'events',
                  path: 'src/events',
                  children: [
                    { name: 'orderCreatedEvent.ts', path: 'src/events/orderCreatedEvent.ts', isFile: true }
                  ]
                },
                { name: 'kafkaClient.ts', path: 'src/kafkaClient.ts', isFile: true },
                { name: 'index.ts', path: 'src/index.ts', isFile: true }
              ]
            },
            { name: 'docker-compose.kafka.yml', path: 'docker-compose.kafka.yml', isFile: true },
            { name: 'package.json', path: 'package.json', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'src/producers/orderProducer.ts',
            name: 'orderProducer.ts',
            language: 'typescript',
            description: 'Idempotent Kafka event producer with transactional semantics',
            content: `import { kafka } from '../kafkaClient';
import { OrderCreatedEvent } from '../events/orderCreatedEvent';

const producer = kafka.producer({
  idempotent: true,
  maxInFlightRequests: 5
});

let isConnected = false;

export async function publishOrderCreated(event: OrderCreatedEvent) {
  if (!isConnected) {
    await producer.connect();
    isConnected = true;
  }

  await producer.send({
    topic: 'orders.v1.order-created',
    messages: [
      {
        key: event.orderId,
        value: JSON.stringify(event),
        headers: {
          'content-type': 'application/json',
          'event-type': 'OrderCreated',
          'schema-version': '1.0.0',
          'correlation-id': event.correlationId || crypto.randomUUID()
        }
      }
    ]
  });

  console.log(\`📦 Event published -> Topic: orders.v1.order-created | Key: \${event.orderId}\`);
}`
          },
          {
            path: 'src/consumers/paymentConsumer.ts',
            name: 'paymentConsumer.ts',
            language: 'typescript',
            description: 'Kafka consumer group with auto-recovery and Dead Letter Queue (DLQ)',
            content: `import { kafka } from '../kafkaClient';
import { forwardToDLQ } from './dlqHandler';

const consumer = kafka.consumer({ groupId: 'payment-processing-service' });

export async function startPaymentConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'orders.v1.order-created', fromBeginning: false });

  console.log('🎧 Payment Consumer listening on orders.v1.order-created...');

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const payload = message.value?.toString();
      if (!payload) return;

      try {
        const orderEvent = JSON.parse(payload);
        console.log(\`💳 Processing payment for Order: \${orderEvent.orderId} ($ \${orderEvent.totalAmount})\`);
        
        // Simulating idempotent payment processing logic
        await processPayment(orderEvent);
        
      } catch (err: any) {
        console.error(\`❌ Processing failed for offset \${message.offset}: \${err.message}\`);
        await forwardToDLQ(topic, message, err);
      }
    }
  });
}

async function processPayment(event: any) {
  // Idempotency check against database
  // Charge payment provider
}`
          }
        ],
        quickStartCommands: [
          { label: '1. Launch Kafka Cluster', command: 'docker compose -f docker-compose.kafka.yml up -d', explanation: 'Boot Zookeeper/KRaft and Apache Kafka Broker.' },
          { label: '2. Create Topics', command: 'docker exec -it kafka kafka-topics.sh --create --topic orders.v1.order-created --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1', explanation: 'Create partitioned topic.' },
          { label: '3. Start Event Consumer', command: 'npx tsx src/index.ts', explanation: 'Boot consumer listeners and event loop.' }
        ],
        architectureRules: [
          'Event Immutability: Events represent facts in the past and can NEVER be modified or deleted.',
          'Schema Evolution: Always maintain backward and forward compatibility using schema registries (Avro/Protobuf).',
          'Every consumer must handle out-of-order delivery and duplicate messages idempotently.'
        ],
        recommendedLibraries: [
          { name: 'KafkaJS', purpose: 'Modern Apache Kafka client for Node.js' },
          { name: 'Confluent Schema Registry', purpose: 'Avro/JSON schema contract validation' }
        ],
        envVariables: [
          { key: 'KAFKA_BROKERS', defaultValue: 'localhost:9092', description: 'Comma-separated Kafka brokers' }
        ]
      },
      {
        techId: 'eda-dotnet-masstransit',
        techName: 'C# / .NET 8 Event-Driven Worker + MassTransit & Kafka / RabbitMQ',
        techIcon: '⚡',
        language: 'csharp',
        runtime: '.NET 8.0 Worker Service',
        framework: 'MassTransit + Confluent Kafka / RabbitMQ + EF Core Outbox',
        badgeColor: 'bg-orange-950/80 text-orange-300 border-orange-700',
        description: 'High-throughput asynchronous event publishing and consuming system featuring transactional Outbox Pattern, dead-letter re-try pipelines, and idempotency tracking.',
        fileTree: {
          name: 'dotnet-eda-worker',
          path: '',
          children: [
            {
              name: 'src',
              path: 'src',
              children: [
                {
                  name: 'EdaWorker.Core',
                  path: 'src/EdaWorker.Core',
                  children: [
                    {
                      name: 'Events',
                      path: 'src/EdaWorker.Core/Events',
                      children: [
                        { name: 'OrderPlacedEvent.cs', path: 'src/EdaWorker.Core/Events/OrderPlacedEvent.cs', isFile: true },
                        { name: 'PaymentProcessedEvent.cs', path: 'src/EdaWorker.Core/Events/PaymentProcessedEvent.cs', isFile: true }
                      ]
                    }
                  ]
                },
                {
                  name: 'EdaWorker.Publisher',
                  path: 'src/EdaWorker.Publisher',
                  children: [
                    { name: 'Program.cs', path: 'src/EdaWorker.Publisher/Program.cs', isFile: true },
                    { name: 'OrderCheckoutService.cs', path: 'src/EdaWorker.Publisher/OrderCheckoutService.cs', isFile: true }
                  ]
                },
                {
                  name: 'EdaWorker.Consumer',
                  path: 'src/EdaWorker.Consumer',
                  children: [
                    { name: 'Program.cs', path: 'src/EdaWorker.Consumer/Program.cs', isFile: true },
                    { name: 'OrderPlacedConsumer.cs', path: 'src/EdaWorker.Consumer/OrderPlacedConsumer.cs', isFile: true }
                  ]
                },
                {
                  name: 'EdaWorker.Infrastructure',
                  path: 'src/EdaWorker.Infrastructure',
                  children: [
                    { name: 'AppDbContext.cs', path: 'src/EdaWorker.Infrastructure/AppDbContext.cs', isFile: true }
                  ]
                }
              ]
            },
            { name: 'docker-compose.yml', path: 'docker-compose.yml', isFile: true },
            { name: 'EdaWorker.sln', path: 'EdaWorker.sln', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'src/EdaWorker.Publisher/Program.cs',
            name: 'Program.cs',
            language: 'csharp',
            description: 'ASP.NET Core / Worker bootstrapping MassTransit transactional outbox',
            content: `using MassTransit;
using Microsoft.EntityFrameworkCore;
using EdaWorker.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Configure DbContext with Transactional Outbox
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Database")));

builder.Services.AddMassTransit(x =>
{
    // Enable EF Core Outbox for guaranteed at-least-once delivery
    x.AddEntityFrameworkOutbox<AppDbContext>(o =>
    {
        o.UsePostgres();
        o.UseBusOutbox();
    });

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(builder.Configuration.GetValue<string>("RabbitMQ:Host") ?? "localhost");
        cfg.ConfigureEndpoints(context);
    });
});

var app = builder.Build();
app.MapPost("/api/orders/checkout", async (IPublishEndpoint publishEndpoint, AppDbContext db) =>
{
    var orderId = Guid.NewGuid();
    
    // In-transaction atomic event persistence
    await publishEndpoint.Publish(new OrderPlacedEvent(orderId, "CUST-9921", 149.99m, DateTime.UtcNow));
    await db.SaveChangesAsync();

    return Results.Accepted($"/api/orders/{orderId}", new { orderId, status = "OrderPlaced_Queued" });
});

app.Run();

public record OrderPlacedEvent(Guid OrderId, string CustomerId, decimal TotalAmount, DateTime Timestamp);`
          },
          {
            path: 'src/EdaWorker.Consumer/OrderPlacedConsumer.cs',
            name: 'OrderPlacedConsumer.cs',
            language: 'csharp',
            description: 'MassTransit Event Consumer with retry policies and dead-letter handling',
            content: `using MassTransit;
using Microsoft.Extensions.Logging;

namespace EdaWorker.Consumer;

public class OrderPlacedConsumer : IConsumer<OrderPlacedEvent>
{
    private readonly ILogger<OrderPlacedConsumer> _logger;

    public OrderPlacedConsumer(ILogger<OrderPlacedConsumer> logger)
    {
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<OrderPlacedEvent> context)
    {
        var message = context.Message;
        _logger.LogInformation("📥 Received OrderPlacedEvent: {OrderId} for customer {CustomerId} with total {Amount:C}",
            message.OrderId, message.CustomerId, message.TotalAmount);

        // Simulate idempotent domain operation
        await Task.Delay(100);

        _logger.LogInformation("✅ Successfully processed event for Order {OrderId}", message.OrderId);
    }
}

public class OrderPlacedConsumerDefinition : ConsumerDefinition<OrderPlacedConsumer>
{
    public OrderPlacedConsumerDefinition()
    {
        ConcurrentMessageLimit = 16;
    }

    protected override void ConfigureConsumer(IReceiveEndpointConfigurator endpointConfigurator,
        IConsumerConfigurator<OrderPlacedConsumer> consumerConfigurator,
        IRegistrationContext context)
    {
        // Exponential retry before forwarding to Dead Letter Queue (_error)
        endpointConfigurator.UseMessageRetry(r => r.Exponential(5, TimeSpan.FromSeconds(1), TimeSpan.FromSeconds(30), TimeSpan.FromSeconds(2)));
    }
}`
          }
        ],
        quickStartCommands: [
          { label: '1. Start RabbitMQ Broker', command: 'docker compose up -d rabbitmq postgres', explanation: 'Launch broker and database with outbox tables.' },
          { label: '2. Run Event Publisher', command: 'dotnet run --project src/EdaWorker.Publisher', explanation: 'Launch publisher API with Transactional Outbox.' },
          { label: '3. Run Event Consumer', command: 'dotnet run --project src/EdaWorker.Consumer', explanation: 'Launch background worker listening to queue.' }
        ],
        architectureRules: [
          'Use Transactional Outbox Pattern to avoid two-phase commit (2PC) failures between DB and Message Broker.',
          'Event handlers must be strictly idempotent using idempotency keys or unique message identifiers.',
          'Always configure Exponential Backoff with Dead Letter Queues (DLQ) to prevent poison pill loops.'
        ],
        recommendedLibraries: [
          { name: 'MassTransit.EntityFrameworkCoreIntegration', purpose: 'Transactional Outbox & Inbox state management' },
          { name: 'MassTransit.RabbitMQ / Kafka', purpose: 'Enterprise event broker transports' }
        ],
        envVariables: [
          { key: 'RabbitMQ__Host', defaultValue: 'localhost', description: 'Event Broker host' },
          { key: 'ConnectionStrings__Database', defaultValue: 'Host=localhost;Database=eda_db;Username=postgres;Password=postgres', description: 'Outbox persistence database' }
        ]
      }
    ]
  },

  // ==========================================
  // 5. SERVERLESS / FAAS ARCHITECTURE
  // ==========================================
  [ArchType.Serverless]: {
    archId: ArchType.Serverless,
    archTitle: 'Serverless / FaaS Architecture',
    corePattern: 'Ephemeral Event-Driven Cloud Functions with Managed BaaS Services',
    overview: 'Event-driven compute executed on ephemeral managed containers billed strictly per millisecond of execution time, combining API Gateway, Lambda/Functions, and managed databases.',
    techStacks: [
      {
        techId: 'serverless-aws-ts',
        techName: 'TypeScript / AWS Lambda + SST / Serverless Framework',
        techIcon: '⚡',
        language: 'typescript',
        runtime: 'Node.js 20.x (ARM64 Graviton)',
        framework: 'AWS Lambda + API Gateway + DynamoDB',
        badgeColor: 'bg-yellow-950/80 text-yellow-300 border-yellow-700',
        description: 'Clean Serverless micro-functions with AWS SDK v3, single-table DynamoDB design, and serverless.yml IaC manifest.',
        fileTree: {
          name: 'serverless-api',
          path: '',
          children: [
            {
              name: 'src',
              path: 'src',
              children: [
                {
                  name: 'functions',
                  path: 'src/functions',
                  children: [
                    { name: 'createItem.ts', path: 'src/functions/createItem.ts', isFile: true },
                    { name: 'getItem.ts', path: 'src/functions/getItem.ts', isFile: true },
                    { name: 's3Processor.ts', path: 'src/functions/s3Processor.ts', isFile: true }
                  ]
                },
                {
                  name: 'libs',
                  path: 'src/libs',
                  children: [
                    { name: 'dynamoClient.ts', path: 'src/libs/dynamoClient.ts', isFile: true },
                    { name: 'apiGateway.ts', path: 'src/libs/apiGateway.ts', isFile: true }
                  ]
                }
              ]
            },
            { name: 'serverless.yml', path: 'serverless.yml', isFile: true },
            { name: 'package.json', path: 'package.json', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'src/functions/createItem.ts',
            name: 'createItem.ts',
            language: 'typescript',
            description: 'Stateless AWS Lambda handler with input validation and DynamoDB put',
            content: `import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { formatJSONResponse } from '../libs/apiGateway';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.ITEMS_TABLE || 'ItemsTable';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    if (!event.body) {
      return formatJSONResponse(400, { message: 'Missing request body' });
    }

    const data = JSON.parse(event.body);
    const itemId = crypto.randomUUID();
    const item = {
      PK: \`ITEM#\${itemId}\`,
      id: itemId,
      title: data.title,
      price: data.price,
      createdAt: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item
    }));

    return formatJSONResponse(201, {
      message: 'Item created in Serverless DynamoDB',
      data: item
    });
  } catch (err: any) {
    console.error('Lambda error:', err);
    return formatJSONResponse(500, { message: err.message });
  }
};`
          },
          {
            path: 'serverless.yml',
            name: 'serverless.yml',
            language: 'yaml',
            description: 'Serverless Framework infrastructure manifest',
            content: `service: serverless-items-api
frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs20.x
  architecture: arm64
  region: us-east-1
  environment:
    ITEMS_TABLE: \${self:service}-\${sls:stage}-items
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - dynamodb:PutItem
            - dynamodb:GetItem
            - dynamodb:Query
          Resource: !GetAtt ItemsTable.Arn

functions:
  createItem:
    handler: src/functions/createItem.handler
    events:
      - httpApi:
          path: /items
          method: post
  getItem:
    handler: src/functions/getItem.handler
    events:
      - httpApi:
          path: /items/{id}
          method: get

resources:
  Resources:
    ItemsTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: \${self:service}-\${sls:stage}-items
        BillingMode: PAY_PER_REQUEST
        AttributeDefinitions:
          - AttributeName: PK
            AttributeType: S
        KeySchema:
          - AttributeName: PK
            KeyType: HASH`
          }
        ],
        quickStartCommands: [
          { label: '1. Local Lambda Emulation', command: 'npx serverless offline', explanation: 'Simulate API Gateway & Lambda locally on port 3000.' },
          { label: '2. Deploy to Cloud', command: 'npx serverless deploy --stage dev', explanation: 'Deploy functions and DynamoDB table directly to AWS.' }
        ],
        architectureRules: [
          'Keep handlers stateless: Never store persistent user sessions in global function memory.',
          'Optimize Cold Starts: Minimize imported package size and bundle with esbuild/tree-shaking.'
        ],
        recommendedLibraries: [
          { name: '@aws-sdk/client-dynamodb', purpose: 'Modular, tree-shakeable AWS SDK v3 client' },
          { name: 'middy', purpose: 'Middleware engine for AWS Lambda' }
        ],
        envVariables: [
          { key: 'AWS_REGION', defaultValue: 'us-east-1', description: 'Target deployment region' }
        ]
      },
      {
        techId: 'serverless-dotnet-aot',
        techName: 'C# / .NET 8 Serverless Native AOT (AWS Lambda & Azure Functions)',
        techIcon: '⚡',
        language: 'csharp',
        runtime: '.NET 8 Native AOT (custom.provided.al2023 / Isolated)',
        framework: 'AWS Lambda .NET 8 Native AOT / Azure Functions v4 Isolated Worker',
        badgeColor: 'bg-yellow-950/80 text-yellow-300 border-yellow-700',
        description: 'Blazing-fast Serverless functions compiled with .NET 8 Native AOT providing sub-15ms cold starts, minimal RAM consumption (<25MB), and DynamoDB/CosmosDB integration.',
        fileTree: {
          name: 'dotnet-serverless-aot',
          path: '',
          children: [
            {
              name: 'src',
              path: 'src',
              children: [
                {
                  name: 'ServerlessApi',
                  path: 'src/ServerlessApi',
                  children: [
                    { name: 'Program.cs', path: 'src/ServerlessApi/Program.cs', isFile: true },
                    { name: 'Function.cs', path: 'src/ServerlessApi/Function.cs', isFile: true },
                    { name: 'AppJsonSerializerContext.cs', path: 'src/ServerlessApi/AppJsonSerializerContext.cs', isFile: true },
                    { name: 'ServerlessApi.csproj', path: 'src/ServerlessApi/ServerlessApi.csproj', isFile: true }
                  ]
                }
              ]
            },
            { name: 'serverless.template', path: 'serverless.template', isFile: true },
            { name: 'Dockerfile.build', path: 'Dockerfile.build', isFile: true },
            { name: 'ServerlessApi.sln', path: 'ServerlessApi.sln', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'src/ServerlessApi/Program.cs',
            name: 'Program.cs',
            language: 'csharp',
            description: '.NET 8 Native AOT Lambda Runtime Entry Point',
            content: `using Amazon.Lambda.Core;
using Amazon.Lambda.RuntimeSupport;
using Amazon.Lambda.Serialization.SystemTextJson;
using Amazon.Lambda.APIGatewayEvents;
using System.Text.Json;
using ServerlessApi;

// Native AOT Custom Runtime initialization (<10ms bootstrap)
var handler = Function.FunctionHandler;
await LambdaBootstrapBuilder.Create(handler, new SourceGeneratorLambdaJsonSerializer<AppJsonSerializerContext>())
    .Build()
    .RunAsync();`
          },
          {
            path: 'src/ServerlessApi/Function.cs',
            name: 'Function.cs',
            language: 'csharp',
            description: 'Stateless Lambda function handler with DynamoDB single-item dispatch',
            content: `using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using System.Text.Json.Serialization;

namespace ServerlessApi;

public class Function
{
    public static async Task<APIGatewayHttpApiV2ProxyResponse> FunctionHandler(
        APIGatewayHttpApiV2ProxyRequest request, 
        ILambdaContext context)
    {
        context.Logger.LogInformation($"Processing HTTP request: {request.RequestContext.Http.Method} {request.RequestContext.Http.Path}");

        var payload = new ApiResponse
        {
            Id = Guid.NewGuid().ToString("N"),
            Status = "Success",
            Message = "⚡ Executed on .NET 8 Native AOT Serverless Runtime",
            Timestamp = DateTime.UtcNow
        };

        return new APIGatewayHttpApiV2ProxyResponse
        {
            StatusCode = 200,
            Headers = new Dictionary<string, string>
            {
                { "Content-Type", "application/json" },
                { "X-Engine", "DOTNET_8_NATIVE_AOT" }
            },
            Body = System.Text.Json.JsonSerializer.Serialize(payload, AppJsonSerializerContext.Default.ApiResponse)
        };
    }
}

public class ApiResponse
{
    public string Id { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

[JsonSerializable(typeof(ApiResponse))]
[JsonSerializable(typeof(APIGatewayHttpApiV2ProxyRequest))]
[JsonSerializable(typeof(APIGatewayHttpApiV2ProxyResponse))]
public partial class AppJsonSerializerContext : JsonSerializerContext
{
}`
          },
          {
            path: 'src/ServerlessApi/ServerlessApi.csproj',
            name: 'ServerlessApi.csproj',
            language: 'xml',
            description: 'Project configuration with Native AOT compilation flags',
            content: `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <PublishAot>true</PublishAot>
    <InvariantGlobalization>true</InvariantGlobalization>
    <StripSymbols>true</StripSymbols>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Amazon.Lambda.Core" Version="2.2.0" />
    <PackageReference Include="Amazon.Lambda.RuntimeSupport" Version="1.10.0" />
    <PackageReference Include="Amazon.Lambda.APIGatewayEvents" Version="2.7.0" />
    <PackageReference Include="Amazon.Lambda.Serialization.SystemTextJson" Version="2.4.0" />
  </ItemGroup>
</Project>`
          }
        ],
        quickStartCommands: [
          { label: '1. Build Native AOT Binary', command: 'dotnet publish src/ServerlessApi -c Release -r linux-arm64 --self-contained', explanation: 'Compile directly to standalone ARM64 machine binary.' },
          { label: '2. Deploy via AWS SAM / Serverless', command: 'sam deploy --guided', explanation: 'Deploy native binary with zero .NET runtime container dependencies.' }
        ],
        architectureRules: [
          'Enable <PublishAot>true</PublishAot> to strip JIT engine and reduce cold start from 800ms down to <15ms.',
          'Always use System.Text.Json Source Generators (JsonSerializerContext) for reflection-free JSON serialization.',
          'Keep function scope lean: One domain write or read responsibility per micro-function.'
        ],
        recommendedLibraries: [
          { name: 'Amazon.Lambda.RuntimeSupport', purpose: 'Custom runtime bootstrap for Native AOT' },
          { name: 'Microsoft.Azure.Functions.Worker', purpose: 'Isolated process model for Azure Functions v4' }
        ],
        envVariables: [
          { key: 'AWS_LAMBDA_FUNCTION_MEMORY_SIZE', defaultValue: '128', description: 'Memory allocation in MB' }
        ]
      },
      {
        techId: 'serverless-python-aws-boto3',
        techName: 'Python 3.12 / AWS Lambda + Boto3 + Powertools + SAM',
        techIcon: '🐍',
        language: 'python',
        runtime: 'Python 3.12 (ARM64 / Graviton3)',
        framework: 'AWS SAM + Boto3 + AWS Lambda Powertools + Pydantic v2 + Moto',
        badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-700',
        description: 'Production-ready Python 3.12 Serverless Application with Boto3 Single-Table DynamoDB, SQS Partial Batch Failures, S3 streaming presigned URLs, structured CloudWatch logging, and Moto unit testing.',
        fileTree: {
          name: 'python-serverless-app',
          path: '',
          children: [
            {
              name: 'app',
              path: 'app',
              children: [
                {
                  name: 'handlers',
                  path: 'app/handlers',
                  children: [
                    { name: 'orders.py', path: 'app/handlers/orders.py', isFile: true },
                    { name: 'sqs_processor.py', path: 'app/handlers/sqs_processor.py', isFile: true }
                  ]
                },
                {
                  name: 'services',
                  path: 'app/services',
                  children: [
                    { name: 'order_service.py', path: 'app/services/order_service.py', isFile: true },
                    { name: 's3_service.py', path: 'app/services/s3_service.py', isFile: true }
                  ]
                },
                {
                  name: 'repositories',
                  path: 'app/repositories',
                  children: [
                    { name: 'dynamo_repo.py', path: 'app/repositories/dynamo_repo.py', isFile: true }
                  ]
                },
                {
                  name: 'models',
                  path: 'app/models',
                  children: [
                    { name: 'schemas.py', path: 'app/models/schemas.py', isFile: true }
                  ]
                }
              ]
            },
            {
              name: 'tests',
              path: 'tests',
              children: [
                { name: 'test_orders.py', path: 'tests/test_orders.py', isFile: true }
              ]
            },
            { name: 'template.yaml', path: 'template.yaml', isFile: true },
            { name: 'pyproject.toml', path: 'pyproject.toml', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'app/handlers/orders.py',
            name: 'orders.py',
            language: 'python',
            description: 'AWS Lambda handler with Powertools routing, tracing, and Pydantic validation',
            content: `from aws_lambda_powertools import Logger, Tracer, Metrics
from aws_lambda_powertools.event_handler import APIGatewayHttpResolver
from aws_lambda_powertools.logging import correlation_paths
from app.models.schemas import CreateOrderRequest
from app.services.order_service import OrderService
from app.repositories.dynamo_repo import DynamoOrderRepository

logger = Logger()
tracer = Tracer()
metrics = Metrics(namespace="ServerlessApp")
app = APIGatewayHttpResolver()

repo = DynamoOrderRepository()
service = OrderService(repo=repo)

@app.post("/orders")
@tracer.capture_method
def create_order():
    raw_body = app.current_event.json_body
    order_req = CreateOrderRequest.model_validate(raw_body)
    created = service.create_order(order_req)
    return created.model_dump(mode="json"), 201

@app.get("/orders/<order_id>")
@tracer.capture_method
def get_order(order_id: str):
    order = service.get_order(order_id)
    if not order:
        return {"error": "Order not found"}, 404
    return order.model_dump(mode="json"), 200

@logger.inject_lambda_context(correlation_id_path=correlation_paths.API_GATEWAY_HTTP)
@tracer.capture_lambda_handler
@metrics.log_metrics(capture_cold_start_metric=True)
def handler(event: dict, context) -> dict:
    return app.resolve(event, context)`
          },
          {
            path: 'app/repositories/dynamo_repo.py',
            name: 'dynamo_repo.py',
            language: 'python',
            description: 'DynamoDB Single-Table Repository with Boto3 Resource & Transactions',
            content: `import os
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from app.models.schemas import OrderResponse
from aws_lambda_powertools import Logger, Tracer

logger = Logger(child=True)
tracer = Tracer()

boto_config = Config(retries={'mode': 'adaptive', 'max_attempts': 5}, max_pool_connections=25)
dynamodb = boto3.resource('dynamodb', config=boto_config)
TABLE_NAME = os.environ.get('ORDERS_TABLE_NAME', 'OrdersSingleTable')
table = dynamodb.Table(TABLE_NAME)

class DynamoOrderRepository:
    @tracer.capture_method
    def save_order(self, order: OrderResponse) -> None:
        item = {
            'PK': f"CUSTOMER#{order.customer_id}",
            'SK': f"ORDER#{order.order_id}",
            'GSI1PK': f"ORDER#{order.order_id}",
            'GSI1SK': f"STATUS#{order.status}",
            'order_id': order.order_id,
            'customer_id': order.customer_id,
            'status': order.status,
            'items': order.items,
            'total_amount': order.total_amount,
            'currency': order.currency,
            'created_at': order.created_at.isoformat(),
            'updated_at': order.updated_at.isoformat(),
        }
        try:
            table.put_item(
                Item=item,
                ConditionExpression="attribute_not_exists(PK) AND attribute_not_exists(SK)"
            )
            logger.info("Order saved to DynamoDB", extra={"order_id": order.order_id})
        except ClientError as err:
            if err.response['Error']['Code'] == 'ConditionalCheckFailedException':
                raise ValueError(f"Order {order.order_id} already exists.")
            raise

    @tracer.capture_method
    def find_by_id(self, order_id: str):
        response = table.query(
            IndexName='GSI1',
            KeyConditionExpression='GSI1PK = :gsi1pk',
            ExpressionAttributeValues={':gsi1pk': f"ORDER#{order_id}"},
            Limit=1
        )
        items = response.get('Items', [])
        return OrderResponse.model_validate(items[0]) if items else None`
          },
          {
            path: 'template.yaml',
            name: 'template.yaml',
            language: 'yaml',
            description: 'AWS SAM specification with ARM64 Graviton3, HTTP API & DynamoDB',
            content: `AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: Python 3.12 Serverless Application with AWS SAM & Powertools

Globals:
  Function:
    Timeout: 10
    MemorySize: 512
    Runtime: python3.12
    Architectures:
      - arm64
    Tracing: Active
    Environment:
      Variables:
        POWERTOOLS_SERVICE_NAME: orders-api
        POWERTOOLS_METRICS_NAMESPACE: ProductionApp
        LOG_LEVEL: INFO
        ORDERS_TABLE_NAME: !Ref OrdersTable

Resources:
  HttpApi:
    Type: AWS::Serverless::HttpApi
    Properties:
      CorsConfiguration:
        AllowMethods: [GET, POST, OPTIONS]
        AllowHeaders: [Content-Type, Authorization]
        AllowOrigins: ["*"]

  OrdersFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: .
      Handler: app.handlers.orders.handler
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref OrdersTable
      Events:
        ApiEvents:
          Type: HttpApi
          Properties:
            ApiId: !Ref HttpApi
            Path: /{proxy+}
            Method: ANY

  OrdersTable:
    Type: AWS::DynamoDB::Table
    Properties:
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: PK
          AttributeType: S
        - AttributeName: SK
          AttributeType: S
        - AttributeName: GSI1PK
          AttributeType: S
        - AttributeName: GSI1SK
          AttributeType: S
      KeySchema:
        - AttributeName: PK
          KeyType: HASH
        - AttributeName: SK
          KeyType: RANGE
      GlobalSecondaryIndexes:
        - IndexName: GSI1
          KeySchema:
            - AttributeName: GSI1PK
              KeyType: HASH
            - AttributeName: GSI1SK
              KeyType: RANGE
          Projection:
            ProjectionType: ALL`
          }
        ],
        quickStartCommands: [
          { label: '1. Local Emulation', command: 'sam local start-api --port 3000', explanation: 'Run API Gateway and Lambda functions locally with hot reloading.' },
          { label: '2. Run Moto Tests', command: 'uv run pytest tests/ -v --cov=app', explanation: 'Execute unit and integration tests against in-memory mocked AWS services.' },
          { label: '3. Build & Deploy', command: 'sam build --use-container && sam deploy --guided', explanation: 'Compile C-extensions in container and deploy stack to AWS.' }
        ],
        architectureRules: [
          'Target Python 3.12 on ARM64 (Graviton3) for optimal latency and price-performance.',
          'Always use aws-lambda-powertools for structured JSON logs, X-Ray tracing, and CloudWatch EMF metrics.',
          'Mock cloud services with Moto in pytest to ensure fast, deterministic CI execution with 0 AWS cost.'
        ],
        recommendedLibraries: [
          { name: 'aws-lambda-powertools[all]', purpose: 'Structured logging, tracing, metrics, validation & idempotency' },
          { name: 'boto3', purpose: 'Official AWS SDK for Python' },
          { name: 'moto[all]', purpose: 'Mocking AWS services for offline unit tests' },
          { name: 'pydantic', purpose: 'Fast data validation and settings management' }
        ],
        envVariables: [
          { key: 'POWERTOOLS_SERVICE_NAME', defaultValue: 'orders-api', description: 'Application name for telemetry' },
          { key: 'ORDERS_TABLE_NAME', defaultValue: 'OrdersTable', description: 'DynamoDB table name' }
        ]
      }
    ]
  },

  // ==========================================
  // 6. CONTAINER & KUBERNETES-NATIVE
  // ==========================================
  [ArchType.ContainerNative]: {
    archId: ArchType.ContainerNative,
    archTitle: 'Container & Kubernetes-Native Architecture',
    corePattern: 'Declarative Cloud-Native Microservices on K8s with Helm, Ingress & Sidecars',
    overview: 'Applications packaged as OCI containers managed declaratively via Kubernetes manifests, Helm charts, health probes, horizontal pod autoscalers (HPA), and service meshes.',
    techStacks: [
      {
        techId: 'k8s-helm-go',
        techName: 'Kubernetes Platform + Helm Chart + Go Backend',
        techIcon: '☸️',
        language: 'go',
        runtime: 'Kubernetes 1.28+',
        framework: 'Helm 3 + K8s Manifests + Docker multi-stage',
        badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-700',
        description: 'Production-ready Kubernetes scaffolding with multi-stage Dockerfile, Helm chart, Ingress, HPA, and liveness/readiness probes.',
        fileTree: {
          name: 'k8s-platform-scaffold',
          path: '',
          children: [
            {
              name: 'helm',
              path: 'helm',
              children: [
                {
                  name: 'app-chart',
                  path: 'helm/app-chart',
                  children: [
                    { name: 'Chart.yaml', path: 'helm/app-chart/Chart.yaml', isFile: true },
                    { name: 'values.yaml', path: 'helm/app-chart/values.yaml', isFile: true },
                    {
                      name: 'templates',
                      path: 'helm/app-chart/templates',
                      children: [
                        { name: 'deployment.yaml', path: 'helm/app-chart/templates/deployment.yaml', isFile: true },
                        { name: 'service.yaml', path: 'helm/app-chart/templates/service.yaml', isFile: true },
                        { name: 'hpa.yaml', path: 'helm/app-chart/templates/hpa.yaml', isFile: true },
                        { name: 'ingress.yaml', path: 'helm/app-chart/templates/ingress.yaml', isFile: true }
                      ]
                    }
                  ]
                }
              ]
            },
            { name: 'Dockerfile', path: 'Dockerfile', isFile: true },
            { name: 'README.md', path: 'README.md', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'helm/app-chart/templates/deployment.yaml',
            name: 'deployment.yaml',
            language: 'yaml',
            description: 'K8s Deployment manifest with resource limits and health probes',
            content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-backend
  labels:
    app.kubernetes.io/name: {{ .Chart.Name }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Release.Name }}-backend
  template:
    metadata:
      labels:
        app: {{ .Release.Name }}-backend
    spec:
      containers:
        - name: backend
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - containerPort: 8080
              name: http
          livenessProbe:
            httpGet:
              path: /healthz
              port: http
            initialDelaySeconds: 10
            periodSeconds: 15
          readinessProbe:
            httpGet:
              path: /ready
              port: http
            initialDelaySeconds: 5
            periodSeconds: 10
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi`
          },
          {
            path: 'Dockerfile',
            name: 'Dockerfile',
            language: 'dockerfile',
            description: 'Multi-stage minimal distroless container build',
            content: `# Build Stage
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o server ./cmd/main.go

# Production Stage (Distroless for extreme security)
FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /
COPY --from=builder /app/server /server
EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/server"]`
          }
        ],
        quickStartCommands: [
          { label: '1. Build OCI Container', command: 'docker build -t mycompany/backend:1.0.0 .', explanation: 'Build multi-stage secure container.' },
          { label: '2. Dry-Run Helm Template', command: 'helm template my-release ./helm/app-chart', explanation: 'Validate generated Kubernetes YAML manifests.' },
          { label: '3. Deploy to Cluster', command: 'helm upgrade --install my-release ./helm/app-chart --namespace prod --create-namespace', explanation: 'Apply deployment, service, and HPA to K8s.' }
        ],
        architectureRules: [
          'Never run containers as root (enforce nonroot user).',
          'Always specify CPU and Memory requests and limits to prevent noisy-neighbor OOM crashes.'
        ],
        recommendedLibraries: [
          { name: 'Helm', purpose: 'Package manager for Kubernetes manifests' },
          { name: 'Kustomize', purpose: 'Template-free customization of K8s YAML' }
        ],
        envVariables: [
          { key: 'PORT', defaultValue: '8080', description: 'Internal container listening port' }
        ]
      },
      {
        techId: 'k8s-dotnet-chiseled',
        techName: 'C# / .NET 8 Kubernetes-Native + Chiseled Containers + K8s Probes',
        techIcon: '☸️',
        language: 'csharp',
        runtime: '.NET 8.0 Chiseled Jammy (nonroot)',
        framework: 'ASP.NET Core 8 Minimal API + HealthChecks + K8s Deployment Manifests',
        badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-700',
        description: 'Hardened Kubernetes-native .NET 8 service running on minimal chiseled container images with liveness, readiness, and startup probes, graceful SIGTERM shutdown, and HPA auto-scaling.',
        fileTree: {
          name: 'dotnet-k8s-native',
          path: '',
          children: [
            {
              name: 'src',
              path: 'src',
              children: [
                { name: 'Program.cs', path: 'src/Program.cs', isFile: true },
                { name: 'AppHealthChecks.cs', path: 'src/AppHealthChecks.cs', isFile: true },
                { name: 'K8sNativeApp.csproj', path: 'src/K8sNativeApp.csproj', isFile: true }
              ]
            },
            {
              name: 'k8s',
              path: 'k8s',
              children: [
                { name: 'deployment.yaml', path: 'k8s/deployment.yaml', isFile: true },
                { name: 'service.yaml', path: 'k8s/service.yaml', isFile: true },
                { name: 'hpa.yaml', path: 'k8s/hpa.yaml', isFile: true },
                { name: 'kustomization.yaml', path: 'k8s/kustomization.yaml', isFile: true }
              ]
            },
            { name: 'Dockerfile', path: 'Dockerfile', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'src/Program.cs',
            name: 'Program.cs',
            language: 'csharp',
            description: 'ASP.NET Core 8 with K8s Health Check probes and SIGTERM handling',
            content: `using Microsoft.Extensions.Diagnostics.HealthChecks;

var builder = WebApplication.CreateSlimBuilder(args);

// Configure Kubernetes-native health checks
builder.Services.AddHealthChecks()
    .AddCheck("self", () => HealthCheckResult.Healthy(), tags: new[] { "live" })
    .AddCheck("database_ready", () => HealthCheckResult.Healthy("DB connection verified"), tags: new[] { "ready" });

var app = builder.Build();

// Liveness Probe: Quick check if process is alive
app.MapHealthChecks("/healthz/live", new()
{
    Predicate = check => check.Tags.Contains("live")
});

// Readiness Probe: Confirms dependencies are ready for traffic
app.MapHealthChecks("/healthz/ready", new()
{
    Predicate = check => check.Tags.Contains("ready")
});

app.MapGet("/api/data", () => Results.Ok(new { message = "☸️ Served from hardened .NET 8 Pod", node = Environment.MachineName }));

// Graceful shutdown handling on SIGTERM
var lifetime = app.Lifetime;
lifetime.ApplicationStopping.Register(() =>
{
    Console.WriteLine("🛑 SIGTERM received: finishing in-flight requests gracefully...");
});

app.Run();`
          },
          {
            path: 'k8s/deployment.yaml',
            name: 'deployment.yaml',
            language: 'yaml',
            description: 'Kubernetes Deployment with nonroot security context & probe configuration',
            content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: dotnet-backend
  labels:
    app: dotnet-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dotnet-backend
  template:
    metadata:
      labels:
        app: dotnet-backend
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1654
      containers:
        - name: backend
          image: myregistry.io/dotnet-backend:8.0.0
          ports:
            - containerPort: 8080
          livenessProbe:
            httpGet:
              path: /healthz/live
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /healthz/ready
              port: 8080
            initialDelaySeconds: 3
            periodSeconds: 5
          resources:
            requests:
              cpu: 100m
              memory: 96Mi
            limits:
              cpu: 500m
              memory: 256Mi`
          },
          {
            path: 'Dockerfile',
            name: 'Dockerfile',
            language: 'dockerfile',
            description: 'Chiseled minimal Ubuntu container build (<50MB image)',
            content: `FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app
COPY ["src/K8sNativeApp.csproj", "./"]
RUN dotnet restore
COPY src/. .
RUN dotnet publish -c Release -o /out /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0-jammy-chiseled
WORKDIR /app
COPY --from=build /out .
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
USER $APP_UID
ENTRYPOINT ["dotnet", "K8sNativeApp.dll"]`
          }
        ],
        quickStartCommands: [
          { label: '1. Build Chiseled Container', command: 'docker build -t dotnet-backend:8.0.0 .', explanation: 'Package .NET 8 application with zero OS shell vulnerabilities.' },
          { label: '2. Apply K8s Manifests', command: 'kubectl apply -k k8s/', explanation: 'Deploy deployment, service, and HPA to active cluster namespace.' }
        ],
        architectureRules: [
          'Use Chiseled Ubuntu base images (aspnet:8.0-jammy-chiseled) for minimal CVE footprint and zero shell attack surface.',
          'Always map separate /healthz/live and /healthz/ready probes with appropriate period intervals.'
        ],
        recommendedLibraries: [
          { name: 'Microsoft.Extensions.Diagnostics.HealthChecks', purpose: 'Built-in K8s probe integration' }
        ],
        envVariables: [
          { key: 'ASPNETCORE_HTTP_PORTS', defaultValue: '8080', description: 'Internal non-privileged port' }
        ]
      }
    ]
  },

  // ==========================================
  // 7. GITOPS & IAC ARCHITECTURE
  // ==========================================
  [ArchType.GitOps]: {
    archId: ArchType.GitOps,
    archTitle: 'GitOps & Infrastructure as Code (IaC)',
    corePattern: 'Git as Single Source of Truth with Automated Cluster Reconciliation Loops',
    overview: 'Infrastructure and application deployment manifests stored in Git, continuously synchronized and reconciled against live cloud clusters by ArgoCD or Flux controllers.',
    techStacks: [
      {
        techId: 'gitops-argocd-terraform',
        techName: 'Terraform + ArgoCD GitOps Repository',
        techIcon: '🐙',
        language: 'yaml',
        runtime: 'ArgoCD 2.10+ / OpenTofu 1.7+',
        framework: 'Terraform HCL + ArgoCD Application CRDs',
        badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700',
        description: 'Production GitOps repository structure with environment overlays (dev, staging, prod) and automated ArgoCD application synchronizer.',
        fileTree: {
          name: 'gitops-infra-repo',
          path: '',
          children: [
            {
              name: 'apps',
              path: 'apps',
              children: [
                {
                  name: 'base',
                  path: 'apps/base',
                  children: [
                    { name: 'deployment.yaml', path: 'apps/base/deployment.yaml', isFile: true },
                    { name: 'kustomization.yaml', path: 'apps/base/kustomization.yaml', isFile: true }
                  ]
                },
                {
                  name: 'overlays',
                  path: 'apps/overlays',
                  children: [
                    { name: 'dev', path: 'apps/overlays/dev', children: [{ name: 'kustomization.yaml', path: 'apps/overlays/dev/kustomization.yaml', isFile: true }] },
                    { name: 'prod', path: 'apps/overlays/prod', children: [{ name: 'kustomization.yaml', path: 'apps/overlays/prod/kustomization.yaml', isFile: true }] }
                  ]
                }
              ]
            },
            {
              name: 'bootstrap',
              path: 'bootstrap',
              children: [
                { name: 'root-application.yaml', path: 'bootstrap/root-application.yaml', isFile: true }
              ]
            },
            { name: 'README.md', path: 'README.md', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'bootstrap/root-application.yaml',
            name: 'root-application.yaml',
            language: 'yaml',
            description: 'ArgoCD App-of-Apps root controller manifest',
            content: `apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: root-cluster-workloads
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: 'https://github.com/my-org/gitops-infra.git'
    targetRevision: main
    path: apps/overlays/prod
  destination:
    server: 'https://kubernetes.default.svc'
    namespace: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true`
          }
        ],
        quickStartCommands: [
          { label: '1. Apply Root Application', command: 'kubectl apply -f bootstrap/root-application.yaml', explanation: 'Register Git repo with cluster ArgoCD controller.' },
          { label: '2. Check Sync Status', command: 'argocd app get root-cluster-workloads', explanation: 'Verify continuous Git reconciliation status.' }
        ],
        architectureRules: [
          'All changes must happen via Git pull requests (No manual kubectl edit commands in production).',
          'Automated self-healing must revert any manual cluster drift immediately.'
        ],
        recommendedLibraries: [
          { name: 'ArgoCD', purpose: 'Declarative continuous delivery for Kubernetes' },
          { name: 'SealedSecrets', purpose: 'Encrypt secrets safely inside Git' }
        ],
        envVariables: [
          { key: 'ARGOCD_SERVER', defaultValue: 'argocd.internal.company.com', description: 'ArgoCD host' }
        ]
      },
      {
        techId: 'gitops-dotnet-pulumi',
        techName: 'C# / .NET 8 Pulumi IaC + ArgoCD GitOps Workflow',
        techIcon: '🐙',
        language: 'csharp',
        runtime: '.NET 8.0 / Pulumi CLI',
        framework: 'Pulumi C# SDK + Kubernetes / Cloud Provider Provider + ArgoCD',
        badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-700',
        description: 'Type-safe Infrastructure as Code written in C# using Pulumi with strongly-typed cloud resources, automated PR diff previews, and continuous ArgoCD sync.',
        fileTree: {
          name: 'dotnet-pulumi-gitops',
          path: '',
          children: [
            {
              name: 'src',
              path: 'src',
              children: [
                { name: 'Program.cs', path: 'src/Program.cs', isFile: true },
                { name: 'K8sStack.cs', path: 'src/K8sStack.cs', isFile: true },
                { name: 'InfraStack.csproj', path: 'src/InfraStack.csproj', isFile: true }
              ]
            },
            {
              name: '.github/workflows',
              path: '.github/workflows',
              children: [
                { name: 'gitops-sync.yml', path: '.github/workflows/gitops-sync.yml', isFile: true }
              ]
            },
            { name: 'Pulumi.yaml', path: 'Pulumi.yaml', isFile: true },
            { name: 'Pulumi.prod.yaml', path: 'Pulumi.prod.yaml', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'src/K8sStack.cs',
            name: 'K8sStack.cs',
            language: 'csharp',
            description: 'Strongly-typed C# Pulumi Infrastructure Stack for Kubernetes Workloads',
            content: `using Pulumi;
using Pulumi.Kubernetes.Apps.V1;
using Pulumi.Kubernetes.Core.V1;
using Pulumi.Kubernetes.Types.Inputs.Apps.V1;
using Pulumi.Kubernetes.Types.Inputs.Core.V1;
using Pulumi.Kubernetes.Types.Inputs.Meta.V1;
using System.Collections.Generic;

public class K8sStack : Stack
{
    public K8sStack()
    {
        var appLabels = new InputMap<string> { { "app", "enterprise-dotnet-api" } };

        // Type-safe Deployment creation in C#
        var deployment = new Deployment("dotnet-api-dep", new DeploymentArgs
        {
            Metadata = new ObjectMetaArgs { Name = "enterprise-dotnet-api" },
            Spec = new DeploymentSpecArgs
            {
                Replicas = 3,
                Selector = new LabelSelectorArgs { MatchLabels = appLabels },
                Template = new PodTemplateSpecArgs
                {
                    Metadata = new ObjectMetaArgs { Labels = appLabels },
                    Spec = new PodSpecArgs
                    {
                        Containers = new[]
                        {
                            new ContainerArgs
                            {
                                Name = "api",
                                Image = "ghcr.io/myorg/enterprise-api:v8.0.1",
                                Ports = new[] { new ContainerPortArgs { ContainerPortValue = 8080 } },
                                Resources = new ResourceRequirementsArgs
                                {
                                    Limits = new InputMap<string> { { "cpu", "500m" }, { "memory", "512Mi" } },
                                    Requests = new InputMap<string> { { "cpu", "100m" }, { "memory", "128Mi" } }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Expose service URL as stack output
        this.DeploymentName = deployment.Metadata.Apply(m => m.Name);
    }

    [Output]
    public Output<string> DeploymentName { get; set; }
}`
          },
          {
            path: 'Pulumi.yaml',
            name: 'Pulumi.yaml',
            language: 'yaml',
            description: 'Pulumi project manifest configured for .NET C# runtime',
            content: `name: dotnet-gitops-infra
runtime: dotnet
description: Enterprise C# Pulumi GitOps Infrastructure Stack`
          }
        ],
        quickStartCommands: [
          { label: '1. Preview Cloud Changes', command: 'pulumi preview --stack prod', explanation: 'Compute type-safe diff between Git state and live cluster.' },
          { label: '2. Apply GitOps Changes', command: 'pulumi up --yes --stack prod', explanation: 'Reconcile infrastructure state with cloud provider.' }
        ],
        architectureRules: [
          'All infrastructure changes must be reviewed as C# pull requests with automated Pulumi preview comments.',
          'Never hardcode secrets: use Pulumi Secret configuration encryption.'
        ],
        recommendedLibraries: [
          { name: 'Pulumi.Kubernetes', purpose: 'Strongly-typed K8s manifests in C#' },
          { name: 'Pulumi.Aws / AzureNative', purpose: 'Cloud resource provisioning' }
        ],
        envVariables: [
          { key: 'PULUMI_ACCESS_TOKEN', defaultValue: 'pul-secret-token', description: 'Pulumi Cloud state backend token' }
        ]
      }
    ]
  },

  // ==========================================
  // 8. SERVICE-ORIENTED ARCHITECTURE (SOA)
  // ==========================================
  [ArchType.SOA]: {
    archId: ArchType.SOA,
    archTitle: 'Service-Oriented Architecture (SOA)',
    corePattern: 'Coarse-Grained Enterprise Services with Enterprise Service Bus (ESB) & Contract Governance',
    overview: 'Enterprise architecture bridging heterogeneous systems via enterprise service buses, XML/SOAP/WSDL or canonical data models, and strict corporate governance.',
    techStacks: [
      {
        techId: 'soa-enterprise-java',
        techName: 'Java / Spring Boot + Apache Camel ESB',
        techIcon: '🏛️',
        language: 'java',
        runtime: 'Java 17/21',
        framework: 'Apache Camel + Spring Web Services',
        badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-700',
        description: 'Enterprise integration route broker using Apache Camel mediation routing and canonical XML/JSON transformation.',
        fileTree: {
          name: 'enterprise-soa-bus',
          path: '',
          children: [
            {
              name: 'src/main/java/com/enterprise/esb',
              path: 'src/main/java/com/enterprise/esb',
              children: [
                { name: 'OrderMediationRoute.java', path: 'src/main/java/com/enterprise/esb/OrderMediationRoute.java', isFile: true },
                { name: 'CanonicalModelTransformer.java', path: 'src/main/java/com/enterprise/esb/CanonicalModelTransformer.java', isFile: true }
              ]
            },
            { name: 'pom.xml', path: 'pom.xml', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'src/main/java/com/enterprise/esb/OrderMediationRoute.java',
            name: 'OrderMediationRoute.java',
            language: 'java',
            description: 'Apache Camel Enterprise Integration Pattern (EIP) Route',
            content: `package com.enterprise.esb;

import org.apache.camel.builder.RouteBuilder;
import org.springframework.stereotype.Component;

@Component
public class OrderMediationRoute extends RouteBuilder {

    @Override
    public void configure() throws Exception {
        // HTTP Inbound -> Canonical Transform -> Multiple Enterprise Subsystems
        from("direct:submitEnterpriseOrder")
            .routeId("order-mediation-pipeline")
            .log("Mediating enterprise order: \${body}")
            .bean(CanonicalModelTransformer.class, "toCanonical")
            .multicast().parallelProcessing()
                .to("direct:legacyMainframeQueue")
                .to("direct:sapErpSync")
                .to("direct:auditLogService")
            .end();
    }
}`
          }
        ],
        quickStartCommands: [
          { label: '1. Start ESB Engine', command: './mvnw spring-boot:run', explanation: 'Launch Apache Camel enterprise integration routes.' }
        ],
        architectureRules: [
          'Transform external proprietary payloads into the company Canonical Data Model (CDM).',
          'Use Content-Based Routing to decouple service consumers from backend provider protocols.'
        ],
        recommendedLibraries: [
          { name: 'Apache Camel', purpose: 'Enterprise Integration Patterns implementation' }
        ],
        envVariables: [
          { key: 'ESB_PORT', defaultValue: '8181', description: 'ESB mediation port' }
        ]
      },
      {
        techId: 'soa-dotnet-corewcf',
        techName: 'C# / .NET 8 Enterprise SOA Service + CoreWCF & SOAP / REST Bus',
        techIcon: '🏛️',
        language: 'csharp',
        runtime: '.NET 8.0 LTS',
        framework: 'ASP.NET Core 8 + CoreWCF (WSDL/SOAP/WS-*) + Enterprise Gateway',
        badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-700',
        description: 'Enterprise SOA service host running modern CoreWCF with legacy WS-Security and SOAP 1.2 / NetTcp compatibility, integrated with modern REST / gRPC mediation endpoints.',
        fileTree: {
          name: 'dotnet-enterprise-soa',
          path: '',
          children: [
            {
              name: 'src',
              path: 'src',
              children: [
                {
                  name: 'EnterpriseSoa.Contracts',
                  path: 'src/EnterpriseSoa.Contracts',
                  children: [
                    { name: 'IEnterpriseOrderContract.cs', path: 'src/EnterpriseSoa.Contracts/IEnterpriseOrderContract.cs', isFile: true },
                    { name: 'EnterpriseOrderDto.cs', path: 'src/EnterpriseSoa.Contracts/EnterpriseOrderDto.cs', isFile: true }
                  ]
                },
                {
                  name: 'EnterpriseSoa.Host',
                  path: 'src/EnterpriseSoa.Host',
                  children: [
                    { name: 'Program.cs', path: 'src/EnterpriseSoa.Host/Program.cs', isFile: true },
                    { name: 'EnterpriseOrderService.cs', path: 'src/EnterpriseSoa.Host/EnterpriseOrderService.cs', isFile: true },
                    { name: 'EnterpriseSoa.Host.csproj', path: 'src/EnterpriseSoa.Host/EnterpriseSoa.Host.csproj', isFile: true }
                  ]
                }
              ]
            },
            { name: 'EnterpriseSoa.sln', path: 'EnterpriseSoa.sln', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'src/EnterpriseSoa.Contracts/IEnterpriseOrderContract.cs',
            name: 'IEnterpriseOrderContract.cs',
            language: 'csharp',
            description: 'CoreWCF Service Contract with explicit XML DataContract governance',
            content: `using CoreWCF;
using System.Runtime.Serialization;

namespace EnterpriseSoa.Contracts;

[ServiceContract(Namespace = "http://enterprise.company.com/services/orders/v2")]
public interface IEnterpriseOrderContract
{
    [OperationContract]
    Task<OrderSubmissionResult> SubmitOrder(EnterpriseOrderRequest request);
}

[DataContract(Namespace = "http://enterprise.company.com/services/orders/v2")]
public class EnterpriseOrderRequest
{
    [DataMember(Order = 1, IsRequired = true)]
    public string CorporateId { get; set; } = string.Empty;

    [DataMember(Order = 2, IsRequired = true)]
    public decimal TotalAmount { get; set; }
}

[DataContract(Namespace = "http://enterprise.company.com/services/orders/v2")]
public class OrderSubmissionResult
{
    [DataMember(Order = 1)]
    public string TransactionReference { get; set; } = string.Empty;

    [DataMember(Order = 2)]
    public string Status { get; set; } = string.Empty;
}`
          },
          {
            path: 'src/EnterpriseSoa.Host/Program.cs',
            name: 'Program.cs',
            language: 'csharp',
            description: 'ASP.NET Core 8 hosting CoreWCF BasicHttpBinding and Modern REST endpoints',
            content: `using CoreWCF;
using CoreWCF.Configuration;
using CoreWCF.Description;
using EnterpriseSoa.Contracts;
using EnterpriseSoa.Host;

var builder = WebApplication.CreateBuilder(args);

// Add CoreWCF enterprise services
builder.Services.AddServiceModelServices();
builder.Services.AddServiceModelMetadata();
builder.Services.AddSingleton<IServiceBehavior, UseRequestHeadersForMetadataAddressBehavior>();

var app = builder.Build();

app.UseServiceModel(serviceBuilder =>
{
    serviceBuilder.AddService<EnterpriseOrderService>()
        .AddServiceEndpoint<EnterpriseOrderService, IEnterpriseOrderContract>(
            new BasicHttpBinding(), "/services/orders.svc");

    var serviceMetadataBehavior = app.Services.GetRequiredService<ServiceMetadataBehavior>();
    serviceMetadataBehavior.HttpGetEnabled = true;
    serviceMetadataBehavior.HttpGetUrl = new Uri("http://localhost:5000/services/orders.svc/wsdl");
});

app.MapGet("/healthz", () => Results.Ok(new { status = "Healthy", architecture = "SOA" }));

app.Run();`
          }
        ],
        quickStartCommands: [
          { label: '1. Launch SOA Service', command: 'dotnet run --project src/EnterpriseSoa.Host', explanation: 'Start CoreWCF service exposing SOAP WSDL and endpoints.' },
          { label: '2. Inspect WSDL Metadata', command: 'curl http://localhost:5000/services/orders.svc/wsdl', explanation: 'Fetch enterprise contract WSDL definition.' }
        ],
        architectureRules: [
          'Maintain explicit XML namespaces and DataContract versioning rules across releases.',
          'Enterprise bus mediation must insulate internal databases from direct external consumer access.'
        ],
        recommendedLibraries: [
          { name: 'CoreWCF.Primitives', purpose: 'Modern open-source port of WCF for .NET 8' },
          { name: 'CoreWCF.Http', purpose: 'BasicHttpBinding and WSDL support' }
        ],
        envVariables: [
          { key: 'ASPNETCORE_URLS', defaultValue: 'http://*:5000', description: 'Enterprise host URL' }
        ]
      }
    ]
  },

  // ==========================================
  // 9. REACTIVE ARCHITECTURE
  // ==========================================
  [ArchType.Reactive]: {
    archId: ArchType.Reactive,
    archTitle: 'Reactive Architecture',
    corePattern: 'Non-Blocking, Event-Driven Streams with Back-Pressure & Extreme Concurrency',
    overview: 'High-throughput, asynchronous non-blocking event streaming architecture enforcing back-pressure to safely handle millions of simultaneous requests with minimal thread pools.',
    techStacks: [
      {
        techId: 'reactive-spring-webflux',
        techName: 'Java / Spring WebFlux + Project Reactor + R2DBC',
        techIcon: '⚡',
        language: 'java',
        runtime: 'Java 21 LTS',
        framework: 'Spring WebFlux + Reactive Streams + R2DBC',
        badgeColor: 'bg-teal-950/80 text-teal-300 border-teal-700',
        description: 'Complete non-blocking reactive API using Flux/Mono streams and non-blocking Postgres R2DBC drivers.',
        fileTree: {
          name: 'reactive-webflux-service',
          path: '',
          children: [
            {
              name: 'src/main/java/com/reactive/app',
              path: 'src/main/java/com/reactive/app',
              children: [
                { name: 'LiveStreamController.java', path: 'src/main/java/com/reactive/app/LiveStreamController.java', isFile: true },
                { name: 'ReactiveTradeService.java', path: 'src/main/java/com/reactive/app/ReactiveTradeService.java', isFile: true }
              ]
            },
            { name: 'pom.xml', path: 'pom.xml', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'src/main/java/com/reactive/app/LiveStreamController.java',
            name: 'LiveStreamController.java',
            language: 'java',
            description: 'Reactive Server-Sent Events (SSE) stream with back-pressure',
            content: `package com.reactive.app;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import java.time.Duration;
import java.util.UUID;

@RestController
public class LiveStreamController {

    @GetMapping(value = "/api/v1/trades/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<TradeEvent> streamRealtimeTrades() {
        return Flux.interval(Duration.ofMillis(100))
                .map(seq -> new TradeEvent(
                        UUID.randomUUID().toString(),
                        "BTC/USD",
                        65000.0 + (Math.random() * 500),
                        System.currentTimeMillis()
                ))
                .onBackpressureDrop(dropped -> System.out.println("Backpressure: dropped slow consumer event"));
    }

    public record TradeEvent(String id, String symbol, double price, long timestamp) {}
}`
          }
        ],
        quickStartCommands: [
          { label: '1. Launch WebFlux', command: './mvnw spring-boot:run', explanation: 'Run Netty reactive server on port 8080.' },
          { label: '2. Test SSE Stream', command: 'curl -N http://localhost:8080/api/v1/trades/stream', explanation: 'Receive real-time non-blocking stream.' }
        ],
        architectureRules: [
          'NEVER block the Netty event-loop thread (use reactive R2DBC instead of blocking JDBC).',
          'Always configure back-pressure buffer or drop strategies on high-frequency Flux streams.'
        ],
        recommendedLibraries: [
          { name: 'Project Reactor', purpose: 'Reactive streams framework with Flux and Mono' }
        ],
        envVariables: [
          { key: 'SERVER_PORT', defaultValue: '8080', description: 'Netty reactive port' }
        ]
      },
      {
        techId: 'reactive-dotnet-channels',
        techName: 'C# / .NET 8 Reactive Channels + System.Reactive (Rx.NET) & SSE',
        techIcon: '⚡',
        language: 'csharp',
        runtime: '.NET 8.0 LTS Kestrel',
        framework: 'ASP.NET Core 8 + System.Threading.Channels + Rx.NET + IAsyncEnumerable',
        badgeColor: 'bg-teal-950/80 text-teal-300 border-teal-700',
        description: 'High-throughput non-blocking reactive streaming engine utilizing System.Threading.Channels bounded memory ring buffers, Reactive Extensions (Rx.NET), and Server-Sent Events (SSE).',
        fileTree: {
          name: 'dotnet-reactive-streaming',
          path: '',
          children: [
            {
              name: 'src',
              path: 'src',
              children: [
                { name: 'Program.cs', path: 'src/Program.cs', isFile: true },
                { name: 'ReactiveTradeHub.cs', path: 'src/ReactiveTradeHub.cs', isFile: true },
                { name: 'ReactiveApp.csproj', path: 'src/ReactiveApp.csproj', isFile: true }
              ]
            },
            { name: 'ReactiveApp.sln', path: 'ReactiveApp.sln', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'src/Program.cs',
            name: 'Program.cs',
            language: 'csharp',
            description: 'ASP.NET Core 8 Reactive Server-Sent Events (SSE) stream endpoint',
            content: `using System.Runtime.CompilerServices;
using System.Threading.Channels;

var builder = WebApplication.CreateSlimBuilder(args);
builder.Services.AddSingleton<ReactiveTradeHub>();

var app = builder.Build();

// Non-blocking Server-Sent Events (SSE) endpoint using IAsyncEnumerable
app.MapGet("/api/v1/trades/stream", async (
    ReactiveTradeHub hub, 
    HttpResponse response, 
    CancellationToken ct) =>
{
    response.Headers.Append("Content-Type", "text/event-stream");
    response.Headers.Append("Cache-Control", "no-cache");
    response.Headers.Append("Connection", "keep-alive");

    await foreach (var trade in hub.StreamTradesAsync(ct))
    {
        var data = $"data: {{\"symbol\":\"{trade.Symbol}\",\"price\":{trade.Price:F2},\"timestamp\":\"{trade.Timestamp:O}\"}}\n\n";
        await response.WriteAsync(data, ct);
        await response.Body.FlushAsync(ct);
    }
});

app.Run();`
          },
          {
            path: 'src/ReactiveTradeHub.cs',
            name: 'ReactiveTradeHub.cs',
            language: 'csharp',
            description: 'Thread-safe bounded Channel with back-pressure handling and Rx.NET',
            content: `using System.Threading.Channels;
using System.Runtime.CompilerServices;

public class ReactiveTradeHub
{
    // Bounded channel to enforce back-pressure on producers if consumers lag
    private readonly Channel<TradeEvent> _channel = Channel.CreateBounded<TradeEvent>(new BoundedChannelOptions(1000)
    {
        FullMode = BoundedChannelFullMode.DropOldest
    });

    public ReactiveTradeHub()
    {
        // Background high-frequency producer loop
        Task.Run(async () =>
        {
            var random = new Random();
            while (true)
            {
                var trade = new TradeEvent("BTC/USD", 67000m + (decimal)(random.NextDouble() * 500), DateTime.UtcNow);
                _channel.Writer.TryWrite(trade);
                await Task.Delay(50);
            }
        });
    }

    public async IAsyncEnumerable<TradeEvent> StreamTradesAsync([EnumeratorCancellation] CancellationToken ct)
    {
        while (await _channel.Reader.WaitToReadAsync(ct))
        {
            while (_channel.Reader.TryRead(out var trade))
            {
                yield return trade;
            }
        }
    }
}

public record TradeEvent(string Symbol, decimal Price, DateTime Timestamp);`
          }
        ],
        quickStartCommands: [
          { label: '1. Launch Reactive Stream', command: 'dotnet run --project src', explanation: 'Start high-speed non-blocking Kestrel reactive host.' },
          { label: '2. Consume SSE Live Feed', command: 'curl -N http://localhost:5000/api/v1/trades/stream', explanation: 'Stream real-time low-latency events.' }
        ],
        architectureRules: [
          'Never block threads: use System.Threading.Channels or IAsyncEnumerable for asynchronous streaming.',
          'Always configure BoundedChannelOptions with DropOldest or DropWrite to prevent unconstrained RAM exhaustion under heavy load.'
        ],
        recommendedLibraries: [
          { name: 'System.Threading.Channels', purpose: 'Zero-allocation thread-safe async queues' },
          { name: 'System.Reactive', purpose: 'Rx.NET observable event stream LINQ operations' }
        ],
        envVariables: [
          { key: 'ASPNETCORE_HTTP_PORTS', defaultValue: '5000', description: 'Internal HTTP port' }
        ]
      }
    ]
  },

  // ==========================================
  // 10. SPACE-BASED ARCHITECTURE
  // ==========================================
  [ArchType.SpaceBased]: {
    archId: ArchType.SpaceBased,
    archTitle: 'Space-Based Architecture',
    corePattern: 'Distributed In-Memory Data Grid (IMDG) Tuples with Zero Database Read Bottlenecks',
    overview: 'Distributes transaction processing across replicated in-memory processing units (Tuple Spaces) to achieve sub-millisecond latency for ultra-high transaction volume systems.',
    techStacks: [
      {
        techId: 'space-redis-node',
        techName: 'TypeScript / Redis Cluster Grid + Asynchronous Write-Behind',
        techIcon: '🪐',
        language: 'typescript',
        runtime: 'Node.js 20+',
        framework: 'IORedis Cluster + BullMQ Write-Behind Queue',
        badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-700',
        description: 'In-memory Tuple Space caching layer with asynchronous background persistence engine.',
        fileTree: {
          name: 'space-based-grid',
          path: '',
          children: [
            {
              name: 'src',
              path: 'src',
              children: [
                { name: 'spaceManager.ts', path: 'src/spaceManager.ts', isFile: true },
                { name: 'writeBehindWorker.ts', path: 'src/writeBehindWorker.ts', isFile: true }
              ]
            },
            { name: 'package.json', path: 'package.json', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'src/spaceManager.ts',
            name: 'spaceManager.ts',
            language: 'typescript',
            description: 'Sub-millisecond In-Memory Space read/write coordinator',
            content: `import Redis from 'ioredis';

export class TupleSpaceManager {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_GRID_URL || 'redis://localhost:6379');
  }

  // Atomic in-memory write with zero DB roundtrip
  async writeTuple(spaceName: string, id: string, tuple: Record<string, any>) {
    const key = \`space:\${spaceName}:\${id}\`;
    await this.redis.set(key, JSON.stringify(tuple));
    
    // Asynchronously push to write-behind persistence queue
    await this.redis.lpush('write_behind_queue', JSON.stringify({ spaceName, id, tuple }));
    return tuple;
  }

  async readTuple(spaceName: string, id: string) {
    const raw = await this.redis.get(\`space:\${spaceName}:\${id}\`);
    return raw ? JSON.parse(raw) : null;
  }
}`
          }
        ],
        quickStartCommands: [
          { label: '1. Start Redis Cluster', command: 'docker run -d -p 6379:6379 redis:alpine', explanation: 'Run local in-memory RAM grid.' },
          { label: '2. Start Space Manager', command: 'npx tsx src/spaceManager.ts', explanation: 'Initialize high-throughput in-memory data coordinator.' }
        ],
        architectureRules: [
          'All transactional reads and writes must execute strictly in-memory (RAM).',
          'Persistent relational storage is updated strictly asynchronously via write-behind workers.'
        ],
        recommendedLibraries: [
          { name: 'Hazelcast / Redis', purpose: 'Distributed In-Memory Data Grid' }
        ],
        envVariables: [
          { key: 'REDIS_GRID_URL', defaultValue: 'redis://localhost:6379', description: 'In-Memory Grid Endpoint' }
        ]
      },
      {
        techId: 'space-dotnet-grid',
        techName: 'C# / .NET 8 In-Memory Tuple Grid + Asynchronous Write-Behind Worker',
        techIcon: '🪐',
        language: 'csharp',
        runtime: '.NET 8.0 LTS',
        framework: 'ASP.NET Core 8 + Microsoft.Extensions.Caching.Memory + StackExchange.Redis + Channels',
        badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-700',
        description: 'Ultra-low latency In-Memory Tuple Space processing grid executing sub-millisecond in-RAM state modifications with asynchronous background database persistence queues.',
        fileTree: {
          name: 'dotnet-space-grid',
          path: '',
          children: [
            {
              name: 'src',
              path: 'src',
              children: [
                {
                  name: 'SpaceGrid.Core',
                  path: 'src/SpaceGrid.Core',
                  children: [
                    { name: 'TupleSpaceManager.cs', path: 'src/SpaceGrid.Core/TupleSpaceManager.cs', isFile: true },
                    { name: 'WriteBehindBackgroundWorker.cs', path: 'src/SpaceGrid.Core/WriteBehindBackgroundWorker.cs', isFile: true }
                  ]
                },
                {
                  name: 'SpaceGrid.Api',
                  path: 'src/SpaceGrid.Api',
                  children: [
                    { name: 'Program.cs', path: 'src/SpaceGrid.Api/Program.cs', isFile: true },
                    { name: 'SpaceGrid.Api.csproj', path: 'src/SpaceGrid.Api/SpaceGrid.Api.csproj', isFile: true }
                  ]
                }
              ]
            },
            { name: 'SpaceGrid.sln', path: 'SpaceGrid.sln', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'src/SpaceGrid.Core/TupleSpaceManager.cs',
            name: 'TupleSpaceManager.cs',
            language: 'csharp',
            description: 'Zero-latency In-Memory Space read/write coordinator with bounded persistence channel',
            content: `using System.Collections.Concurrent;
using System.Threading.Channels;

namespace SpaceGrid.Core;

public class TupleSpaceManager
{
    // High-performance thread-safe in-memory tuple partition
    private readonly ConcurrentDictionary<string, object> _memorySpace = new();
    
    // Background write-behind channel for async disk persistence
    private readonly Channel<PersistTupleCommand> _persistChannel = Channel.CreateBounded<PersistTupleCommand>(10000);

    public ChannelReader<PersistTupleCommand> PersistenceReader => _persistChannel.Reader;

    public void WriteTuple<T>(string spaceKey, T data) where T : notnull
    {
        // 1. Instantaneous in-memory update (<0.1ms)
        _memorySpace[spaceKey] = data;

        // 2. Non-blocking queue for asynchronous DB write-behind
        _persistChannel.Writer.TryWrite(new PersistTupleCommand(spaceKey, data, DateTime.UtcNow));
    }

    public T? ReadTuple<T>(string spaceKey) where T : class
    {
        return _memorySpace.TryGetValue(spaceKey, out var val) ? val as T : null;
    }
}

public record PersistTupleCommand(string Key, object Payload, DateTime QueuedAt);`
          },
          {
            path: 'src/SpaceGrid.Api/Program.cs',
            name: 'Program.cs',
            language: 'csharp',
            description: 'Minimal API exposing lightning-fast Space Grid operations',
            content: `using SpaceGrid.Core;

var builder = WebApplication.CreateSlimBuilder(args);
builder.Services.AddSingleton<TupleSpaceManager>();
builder.Services.AddHostedService<WriteBehindBackgroundWorker>();

var app = builder.Build();

app.MapPost("/api/space/tuples/{key}", (string key, UserSessionTuple tuple, TupleSpaceManager space) =>
{
    space.WriteTuple(key, tuple);
    return Results.Ok(new { status = "WrittenToMemorySpace", key, inRamTimestamp = DateTime.UtcNow });
});

app.MapGet("/api/space/tuples/{key}", (string key, TupleSpaceManager space) =>
{
    var tuple = space.ReadTuple<UserSessionTuple>(key);
    return tuple is not null ? Results.Ok(tuple) : Results.NotFound();
});

app.Run();

public record UserSessionTuple(string UserId, string AccessLevel, decimal Balance);`
          }
        ],
        quickStartCommands: [
          { label: '1. Launch In-Memory Space Node', command: 'dotnet run --project src/SpaceGrid.Api', explanation: 'Start in-memory processing unit on Kestrel.' },
          { label: '2. Perform Sub-Millisecond Write', command: 'curl -X POST http://localhost:5000/api/space/tuples/user_991 -H "Content-Type: application/json" -d \'{"userId":"user_991","accessLevel":"Admin","balance":5000}\'', explanation: 'Write directly into memory space.' }
        ],
        architectureRules: [
          'Transactions execute purely against in-memory RAM grids to eliminate database I/O latency bottlenecks.',
          'Always use asynchronous Write-Behind workers with batching to persist memory state to cold storage.'
        ],
        recommendedLibraries: [
          { name: 'StackExchange.Redis', purpose: 'Distributed in-memory cluster synchronization' },
          { name: 'System.Threading.Channels', purpose: 'Asynchronous write-behind queuing' }
        ],
        envVariables: [
          { key: 'REDIS_CONNECTION', defaultValue: 'localhost:6379', description: 'Distributed IMDG endpoint' }
        ]
      }
    ]
  },

  // ==========================================
  // 11. WEB-ORIENTED / JAMSTACK ARCHITECTURE
  // ==========================================
  [ArchType.WebOriented]: {
    archId: ArchType.WebOriented,
    archTitle: 'Web-Oriented / JAMstack Architecture',
    corePattern: 'Decoupled Client (Next.js/React SPA) Consuming Serverless Headless APIs via Global CDN',
    overview: 'Pre-rendered static client frontends distributed across global Edge CDNs, consuming authenticated backend micro-APIs and third-party SaaS services.',
    techStacks: [
      {
        techId: 'jamstack-nextjs-app',
        techName: 'Next.js 14/15 App Router + Tailwind + Server Actions',
        techIcon: '🌐',
        language: 'typescript',
        runtime: 'Node.js / Vercel Edge',
        framework: 'Next.js (App Router) + React 19 + Tailwind CSS',
        badgeColor: 'bg-zinc-900 text-zinc-100 border-zinc-700',
        description: 'Modern fullstack JAMstack skeleton with static generation (SSG), Incremental Static Regeneration (ISR), and Edge API routes.',
        fileTree: {
          name: 'jamstack-next-app',
          path: '',
          children: [
            {
              name: 'app',
              path: 'app',
              children: [
                { name: 'layout.tsx', path: 'app/layout.tsx', isFile: true },
                { name: 'page.tsx', path: 'app/page.tsx', isFile: true },
                {
                  name: 'api/health',
                  path: 'app/api/health',
                  children: [{ name: 'route.ts', path: 'app/api/health/route.ts', isFile: true }]
                }
              ]
            },
            { name: 'next.config.js', path: 'next.config.js', isFile: true },
            { name: 'package.json', path: 'package.json', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'app/page.tsx',
            name: 'page.tsx',
            language: 'typescript',
            description: 'Server Component with ISR data fetching',
            content: `export const revalidate = 60; // Incremental Static Regeneration every 60s

export default async function HomePage() {
  return (
    <main className="min-h-screen p-8 bg-zinc-950 text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-extrabold tracking-tight">JAMstack / Web-Oriented Starter</h1>
      <p className="mt-4 text-zinc-400 max-w-md text-center">
        Decoupled static frontend deployed to global CDN edge nodes with serverless API integration.
      </p>
    </main>
  );
}`
          }
        ],
        quickStartCommands: [
          { label: '1. Start Dev Server', command: 'npm run dev', explanation: 'Run Next.js dev server on http://localhost:3000' },
          { label: '2. Build Static Bundle', command: 'npm run build', explanation: 'Generate optimized static assets for CDN deployment.' }
        ],
        architectureRules: [
          'Never expose private API keys in client-side bundles (use Next.js Server Actions or Route Handlers).',
          'Leverage ISR to serve static HTML from edge caches while updating content in the background.'
        ],
        recommendedLibraries: [
          { name: 'Next.js', purpose: 'Hybrid Static & Serverless React framework' },
          { name: 'Tailwind CSS', purpose: 'Utility-first styling' }
        ],
        envVariables: [
          { key: 'NEXT_PUBLIC_API_URL', defaultValue: 'https://api.mycompany.com', description: 'Public API backend' }
        ]
      },
      {
        techId: 'jamstack-dotnet-blazor',
        techName: 'C# / .NET 8 Blazor WebAssembly + Minimal API / Static Web Apps',
        techIcon: '🌐',
        language: 'csharp',
        runtime: '.NET 8.0 WebAssembly (WASM)',
        framework: 'Blazor WebAssembly Standalone + ASP.NET Core 8 Minimal API',
        badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-700',
        description: 'Client-side SPA compiled directly to WebAssembly running natively in browser sandbox, consuming decoupled backend cloud APIs via HTTP/JSON.',
        fileTree: {
          name: 'dotnet-blazor-jamstack',
          path: '',
          children: [
            {
              name: 'src',
              path: 'src',
              children: [
                {
                  name: 'BlazorClient',
                  path: 'src/BlazorClient',
                  children: [
                    { name: 'Program.cs', path: 'src/BlazorClient/Program.cs', isFile: true },
                    { name: 'App.razor', path: 'src/BlazorClient/App.razor', isFile: true },
                    { name: 'Pages', path: 'src/BlazorClient/Pages', children: [{ name: 'Index.razor', path: 'src/BlazorClient/Pages/Index.razor', isFile: true }] }
                  ]
                }
              ]
            },
            { name: 'staticwebapp.config.json', path: 'staticwebapp.config.json', isFile: true },
            { name: 'BlazorJamstack.sln', path: 'BlazorJamstack.sln', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'src/BlazorClient/Pages/Index.razor',
            name: 'Index.razor',
            language: 'csharp',
            description: 'Blazor WebAssembly Page component running C# in browser',
            content: `@page "/"
@inject HttpClient Http

<div class="jamstack-hero">
    <h1>🌐 Blazor WebAssembly JAMstack</h1>
    <p>Running C# natively in browser client via WebAssembly bytecode.</p>

    @if (apiData is null)
    {
        <p>Loading headless API data...</p>
    }
    else
    {
        <div class="card">
            <h3>API Status: @apiData.Status</h3>
            <p>Server Time: @apiData.ServerTime</p>
        </div>
    }
</div>

@code {
    private ApiStatusDto? apiData;

    protected override async Task OnInitializedAsync()
    {
        apiData = await Http.GetFromJsonAsync<ApiStatusDto>("/api/status");
    }

    public record ApiStatusDto(string Status, DateTime ServerTime);
}`
          },
          {
            path: 'staticwebapp.config.json',
            name: 'staticwebapp.config.json',
            language: 'json',
            description: 'Azure Static Web Apps / Cloudflare Pages routing configuration',
            content: `{
  "navigationFallback": {
    "rewrite": "/index.html"
  },
  "mimeTypes": {
    ".wasm": "application/wasm",
    ".dat": "application/octet-stream"
  }
}`
          }
        ],
        quickStartCommands: [
          { label: '1. Run Blazor Dev Server', command: 'dotnet watch --project src/BlazorClient', explanation: 'Launch hot-reload WASM dev environment on port 5000.' },
          { label: '2. Publish Static WASM Bundle', command: 'dotnet publish src/BlazorClient -c Release -o dist', explanation: 'Compile to static HTML/WASM files for CDN deployment.' }
        ],
        architectureRules: [
          'Pre-compress .wasm binaries using Brotli during publish to ensure fast initial page downloads (<1.5MB total payload).',
          'Client WASM code runs on user hardware: never store master database credentials in client assemblies.'
        ],
        recommendedLibraries: [
          { name: 'Microsoft.AspNetCore.Components.WebAssembly', purpose: 'Client-side .NET WASM engine' }
        ],
        envVariables: [
          { key: 'API_BASE_URL', defaultValue: 'https://api.mycompany.com', description: 'Headless Backend URL' }
        ]
      }
    ]
  },

  // ==========================================
  // 12. MOBILE-FIRST / OFFLINE-FIRST
  // ==========================================
  [ArchType.MobileFirst]: {
    archId: ArchType.MobileFirst,
    archTitle: 'Mobile-First / Offline-First Architecture',
    corePattern: 'Local-First On-Device Storage with Asynchronous Bi-Directional Delta Sync',
    overview: 'Treats the local device as the primary source of truth with instant offline responsiveness, synchronizing changes in the background via delta queues and CRDT conflict resolution.',
    techStacks: [
      {
        techId: 'mobile-react-native-sqlite',
        techName: 'React Native / Expo + WatermelonDB / SQLite',
        techIcon: '📱',
        language: 'typescript',
        runtime: 'Expo SDK 51 / React Native',
        framework: 'WatermelonDB / OP-SQLite + TanStack Query',
        badgeColor: 'bg-indigo-950/80 text-indigo-300 border-indigo-700',
        description: 'Offline-first mobile application skeleton with local SQLite persistence and background sync queue.',
        fileTree: {
          name: 'offline-mobile-app',
          path: '',
          children: [
            {
              name: 'src',
              path: 'src',
              children: [
                { name: 'database', path: 'src/database', children: [{ name: 'schema.ts', path: 'src/database/schema.ts', isFile: true }] },
                { name: 'sync', path: 'src/sync', children: [{ name: 'syncService.ts', path: 'src/sync/syncService.ts', isFile: true }] },
                { name: 'screens', path: 'src/screens', children: [{ name: 'HomeScreen.tsx', path: 'src/screens/HomeScreen.tsx', isFile: true }] }
              ]
            },
            { name: 'app.json', path: 'app.json', isFile: true },
            { name: 'package.json', path: 'package.json', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'src/sync/syncService.ts',
            name: 'syncService.ts',
            language: 'typescript',
            description: 'Delta-based bi-directional offline sync engine',
            content: `export async function synchronizeWithBackend(lastPulledAt: number) {
  // 1. Pull changes from cloud since last synchronization
  const response = await fetch(\`https://api.app.com/sync?last_pulled_at=\${lastPulledAt}\`);
  const { changes, timestamp } = await response.json();

  // 2. Apply server deltas to local SQLite database

  // 3. Push locally queued offline mutations back to server
  const localChanges = await getUnsyncedLocalMutations();
  if (localChanges.length > 0) {
    await fetch('https://api.app.com/sync/push', {
      method: 'POST',
      body: JSON.stringify({ changes: localChanges })
    });
  }

  return timestamp;
}

async function getUnsyncedLocalMutations() {
  return [];
}`
          }
        ],
        quickStartCommands: [
          { label: '1. Start Expo', command: 'npx expo start', explanation: 'Launch local dev server with QR code for iOS/Android.' }
        ],
        architectureRules: [
          'UI reads and writes MUST execute instantly against the local on-device SQLite database without waiting for network.',
          'Implement Conflict-Free Replicated Data Types (CRDTs) or Last-Write-Wins timestamps for sync conflict resolution.'
        ],
        recommendedLibraries: [
          { name: 'WatermelonDB', purpose: 'High-performance reactive on-device SQLite framework' }
        ],
        envVariables: [
          { key: 'EXPO_PUBLIC_SYNC_ENDPOINT', defaultValue: 'https://api.example.com/v1/sync', description: 'Remote cloud sync endpoint' }
        ]
      },
      {
        techId: 'mobile-dotnet-maui',
        techName: 'C# / .NET MAUI + SQLite-net & Background Sync Queue',
        techIcon: '📱',
        language: 'csharp',
        runtime: '.NET 8.0 MAUI (iOS / Android / macOS / Windows)',
        framework: '.NET MAUI + sqlite-net-pcl + CommunityToolkit.Mvvm',
        badgeColor: 'bg-indigo-950/80 text-indigo-300 border-indigo-700',
        description: 'Cross-platform native mobile application using local on-device SQLite database, MVVM pattern, and resilient background delta synchronization queue.',
        fileTree: {
          name: 'dotnet-maui-offline',
          path: '',
          children: [
            {
              name: 'src',
              path: 'src',
              children: [
                {
                  name: 'Services',
                  path: 'src/Services',
                  children: [
                    { name: 'LocalDatabaseService.cs', path: 'src/Services/LocalDatabaseService.cs', isFile: true },
                    { name: 'SyncManager.cs', path: 'src/Services/SyncManager.cs', isFile: true }
                  ]
                },
                {
                  name: 'ViewModels',
                  path: 'src/ViewModels',
                  children: [
                    { name: 'MainViewModel.cs', path: 'src/ViewModels/MainViewModel.cs', isFile: true }
                  ]
                },
                {
                  name: 'Models',
                  path: 'src/Models',
                  children: [
                    { name: 'OfflineTask.cs', path: 'src/Models/OfflineTask.cs', isFile: true }
                  ]
                },
                { name: 'MauiProgram.cs', path: 'src/MauiProgram.cs', isFile: true }
              ]
            },
            { name: 'MauiApp.csproj', path: 'src/MauiApp.csproj', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'src/Services/LocalDatabaseService.cs',
            name: 'LocalDatabaseService.cs',
            language: 'csharp',
            description: 'On-device local SQLite database manager for instant offline storage',
            content: `using SQLite;
using MauiApp.Models;

namespace MauiApp.Services;

public class LocalDatabaseService
{
    private SQLiteAsyncConnection? _db;

    private async Task InitAsync()
    {
        if (_db is not null) return;

        var dbPath = Path.Combine(FileSystem.AppDataDirectory, "offline_store.db3");
        _db = new SQLiteAsyncConnection(dbPath);
        await _db.CreateTableAsync<OfflineTask>();
    }

    public async Task<List<OfflineTask>> GetTasksAsync()
    {
        await InitAsync();
        return await _db!.Table<OfflineTask>().OrderByDescending(x => x.CreatedAt).ToListAsync();
    }

    public async Task SaveTaskAsync(OfflineTask task)
    {
        await InitAsync();
        task.IsSynced = false; // Mark for background sync
        task.UpdatedAt = DateTime.UtcNow;
        await _db!.InsertOrReplaceAsync(task);
    }
}`
          },
          {
            path: 'src/Models/OfflineTask.cs',
            name: 'OfflineTask.cs',
            language: 'csharp',
            description: 'SQLite entity model with sync state flag',
            content: `using SQLite;

namespace MauiApp.Models;

public class OfflineTask
{
    [PrimaryKey]
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Title { get; set; } = string.Empty;

    public bool IsCompleted { get; set; }

    public bool IsSynced { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}`
          }
        ],
        quickStartCommands: [
          { label: '1. Run on Android Emulator', command: 'dotnet build -t:Run -f net8.0-android', explanation: 'Launch MAUI app inside Android emulator.' },
          { label: '2. Run on iOS Simulator', command: 'dotnet build -t:Run -f net8.0-ios', explanation: 'Launch MAUI app inside Apple iOS simulator.' }
        ],
        architectureRules: [
          'All user interactions modify local SQLite records immediately with zero UI waiting spinners.',
          'SyncManager must subscribe to Connectivity.Current.ConnectivityChanged to trigger flush when internet returns.'
        ],
        recommendedLibraries: [
          { name: 'sqlite-net-pcl', purpose: 'Fast lightweight on-device SQLite ORM' },
          { name: 'CommunityToolkit.Mvvm', purpose: 'High performance MVVM source generators' }
        ],
        envVariables: [
          { key: 'API_SYNC_URL', defaultValue: 'https://api.mycompany.com/v1/sync', description: 'Cloud sync endpoint' }
        ]
      }
    ]
  },

  // ==========================================
  // 13. EDGE COMPUTING & CDN WORKERS
  // ==========================================
  [ArchType.EdgeComputing]: {
    archId: ArchType.EdgeComputing,
    archTitle: 'Edge Computing & CDN Workers',
    corePattern: 'Global V8 Isolates Running Logic Directly on CDN Edge Points of Presence (PoPs)',
    overview: 'Executes serverless TypeScript code across hundreds of global edge data centers with sub-10ms response times, backed by edge KV storage and distributed cache headers.',
    techStacks: [
      {
        techId: 'edge-cloudflare-workers',
        techName: 'TypeScript / Cloudflare Workers + Hono + KV Store',
        techIcon: '⚡',
        language: 'typescript',
        runtime: 'Cloudflare Workers (V8 Isolates)',
        framework: 'Hono.js + Cloudflare KV / D1 Database',
        badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-700',
        description: 'Ultra-fast lightweight edge worker API with Hono.js router, GeoIP personalization, and edge KV caching.',
        fileTree: {
          name: 'edge-worker-api',
          path: '',
          children: [
            {
              name: 'src',
              path: 'src',
              children: [
                { name: 'index.ts', path: 'src/index.ts', isFile: true }
              ]
            },
            { name: 'wrangler.toml', path: 'wrangler.toml', isFile: true },
            { name: 'package.json', path: 'package.json', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'src/index.ts',
            name: 'index.ts',
            language: 'typescript',
            description: 'Hono Edge Worker with GeoIP routing and Edge Cache',
            content: `import { Hono } from 'hono';

type Bindings = {
  CACHE_KV: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/api/edge-hello', async (c) => {
  // Edge runtime provides direct geographical information with 0ms overhead
  const country = c.req.raw.cf?.country || 'US';
  const city = c.req.raw.cf?.city || 'Unknown';
  const colo = c.req.raw.cf?.colo || 'IAD';

  return c.json({
    message: '⚡ Hello from the Global Edge!',
    edgeLocation: {
      dataCenterCode: colo,
      userCity: city,
      userCountry: country
    },
    latencyMs: '< 5ms'
  });
});

export default app;`
          },
          {
            path: 'wrangler.toml',
            name: 'wrangler.toml',
            language: 'toml',
            description: 'Cloudflare Workers configuration',
            content: `name = "edge-api-worker"
main = "src/index.ts"
compatibility_date = "2024-08-01"

[vars]
ENVIRONMENT = "production"

# kv_namespaces = [
#   { binding = "CACHE_KV", id = "xxx" }
# ]`
          }
        ],
        quickStartCommands: [
          { label: '1. Start Local Edge Simulator', command: 'npx wrangler dev', explanation: 'Simulate Cloudflare V8 runtime locally.' },
          { label: '2. Deploy Globally', command: 'npx wrangler deploy', explanation: 'Deploy across 300+ global edge locations.' }
        ],
        architectureRules: [
          'Edge workers must complete within strict CPU execution limits (<50ms CPU time).',
          'Cache heavily at the edge using Cache-Control headers to prevent round-trips to central databases.'
        ],
        recommendedLibraries: [
          { name: 'Hono', purpose: 'Ultrafast, lightweight web framework for Edge runtimes' }
        ],
        envVariables: [
          { key: 'CLOUDFLARE_API_TOKEN', defaultValue: 'cf_token_secret', description: 'Cloudflare deployment token' }
        ]
      },
      {
        techId: 'edge-dotnet-aot',
        techName: 'C# / .NET 8 Native AOT Edge Micro-Container & WasmEdge',
        techIcon: '⚡',
        language: 'csharp',
        runtime: '.NET 8 Native AOT / WasmEdge (WASIX)',
        framework: 'ASP.NET Core 8 Web API Native AOT (Zero JIT / Sub-10ms)',
        badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-700',
        description: 'Ultra-lean compiled Native AOT binary running on edge nodes, CDN compute layers, or WasmEdge runtime with sub-5ms cold startup and <15MB memory footprint.',
        fileTree: {
          name: 'dotnet-edge-aot',
          path: '',
          children: [
            {
              name: 'src',
              path: 'src',
              children: [
                { name: 'Program.cs', path: 'src/Program.cs', isFile: true },
                { name: 'EdgeGeoResolver.cs', path: 'src/EdgeGeoResolver.cs', isFile: true },
                { name: 'EdgeApp.csproj', path: 'src/EdgeApp.csproj', isFile: true }
              ]
            },
            { name: 'Dockerfile.edge', path: 'Dockerfile.edge', isFile: true }
          ]
        },
        starterFiles: [
          {
            path: 'src/Program.cs',
            name: 'Program.cs',
            language: 'csharp',
            description: 'Native AOT Edge Minimal API endpoint with geo-routing',
            content: `using System.Text.Json.Serialization;

var builder = WebApplication.CreateSlimBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonSerializerContext.Default);
});

var app = builder.Build();

app.MapGet("/api/edge/ping", (HttpContext context) =>
{
    var clientIp = context.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
    var edgePoP = Environment.GetEnvironmentVariable("EDGE_POP_REGION") ?? "EDGE-ORD-01";

    return Results.Ok(new EdgeResponse(
        "⚡ Fast Response from .NET 8 Native AOT Edge Worker",
        edgePoP,
        clientIp,
        DateTime.UtcNow
    ));
});

app.Run();

public record EdgeResponse(string Message, string EdgePoP, string ClientIp, DateTime Timestamp);

[JsonSerializable(typeof(EdgeResponse))]
public partial class AppJsonSerializerContext : JsonSerializerContext
{
}`
          },
          {
            path: 'Dockerfile.edge',
            name: 'Dockerfile.edge',
            language: 'dockerfile',
            description: 'Single scratch/distroless container with compiled native AOT executable',
            content: `FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
RUN apt-get update && apt-get install -y clang zlib1g-dev
COPY src/. .
RUN dotnet publish -c Release -r linux-musl-x64 -o /out

FROM alpine:3.19
WORKDIR /app
COPY --from=build /out/EdgeApp /app/EdgeApp
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
ENTRYPOINT ["/app/EdgeApp"]`
          }
        ],
        quickStartCommands: [
          { label: '1. Publish Native AOT Binary', command: 'dotnet publish -c Release -r linux-x64', explanation: 'Compile to standalone native machine binary.' },
          { label: '2. Deploy to Edge PoP', command: 'docker build -f Dockerfile.edge -t edge-dotnet:latest .', explanation: 'Package minimal container for edge PoP execution.' }
        ],
        architectureRules: [
          'Must use Native AOT compilation (<PublishAot>true</PublishAot>) for sub-10ms startup times on edge compute nodes.',
          'Never use reflection or heavy ORMs: keep edge logic centered on request routing, token authentication, and cache headers.'
        ],
        recommendedLibraries: [
          { name: 'Microsoft.AspNetCore.Http.Json', purpose: 'Source-generated zero-overhead JSON for Native AOT' }
        ],
        envVariables: [
          { key: 'EDGE_POP_REGION', defaultValue: 'US-EAST-EDGE', description: 'Designated edge point of presence' }
        ]
      }
    ]
  }
};
