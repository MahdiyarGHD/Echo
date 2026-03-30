namespace Echo.Common.Security;

public static class CorsConfiguration
{
    public const string PolicyName = "EchoPolicy";

    public static IServiceCollection AddEchoCors(this IServiceCollection services, IConfiguration configuration)
    {
        var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? ["http://localhost:3000"];

        services.AddCors(options =>
        {
            options.AddPolicy(PolicyName, policy =>
            {
                policy.WithOrigins(allowedOrigins)
                    .WithMethods("GET", "POST")
                    .WithHeaders("Content-Type", "Accept")
                    .DisallowCredentials();
            });
        });

        return services;
    }
}
