using Echo;
using Echo.Common.Middleware;
using Echo.Common.Options;
using Echo.Common.Persistence;
using Echo.Common.Providers;
using Echo.Common.Security;
using Echo.Common.Services;
using Echo.Features.Paste;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<EchoDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Host=localhost;Database=echo;Username=echo;Password=echo_password",
        npgsql => npgsql.EnableRetryOnFailure()));

builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<PasteService>();
builder.Services.AddScoped<AccessCodeGenerator>();
builder.Services.AddValidatorsFromAssemblyContaining<IAssemblyMarker>();
builder.Services.AddEchoRateLimiting(builder.Configuration);
builder.Services.AddEchoCors(builder.Configuration);
builder.Services.AddTransient<GlobalExceptionHandler>();

builder.Services.Configure<PasteOptions>(builder.Configuration.GetSection(PasteOptions.SectionName));
builder.Services.Configure<DatabaseMaintenanceOptions>(builder.Configuration.GetSection(DatabaseMaintenanceOptions.SectionName));
builder.Services.AddHostedService<DatabaseMaintenanceService>();
builder.Services.AddHostedService<PasteCleanupService>();

var app = builder.Build();

if (builder.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "My API v1");
    });
}

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

app.UseEchoForwardedHeaders(builder.Configuration);
app.UseMiddleware<GlobalExceptionHandler>();
app.UseCors(CorsConfiguration.PolicyName);
app.UseRateLimiter();
app.UseHttpsRedirection();
app.MapControllers();

app.Run();
