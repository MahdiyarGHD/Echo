using Echo.Common.Middleware;
using Echo.Common.Persistence;
using Echo.Common.Providers;
using Echo.Common.Security;
using Echo.Features.Paste;
using Echo.Features.Paste.DTOs;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<EchoDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Data Source=echo.db"));

builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<PasteService>();
builder.Services.AddScoped<AccessCodeGenerator>();
builder.Services.AddValidatorsFromAssemblyContaining<CreatePasteRequestValidator>();
builder.Services.AddEchoRateLimiting(builder.Configuration);
builder.Services.AddEchoCors(builder.Configuration);
builder.Services.AddTransient<GlobalExceptionHandler>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<EchoDbContext>();
    db.Database.Migrate();
}

app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["Referrer-Policy"] = "no-referrer";
    await next();
});

app.UseMiddleware<GlobalExceptionHandler>();
app.UseCors(CorsConfiguration.PolicyName);
app.UseRateLimiter();
app.UseHttpsRedirection();
app.MapControllers();

app.Run();
