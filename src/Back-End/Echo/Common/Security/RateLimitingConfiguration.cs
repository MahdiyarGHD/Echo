using System.Threading.RateLimiting;

namespace Echo.Common.Security;

public static class RateLimitingConfiguration
{
    public const string CreatePastePolicy = "create-paste";
    public const string ReadPastePolicy = "read-paste";

    public static IServiceCollection AddEchoRateLimiting(this IServiceCollection services, IConfiguration configuration)
    {
        var createLimit = configuration.GetValue<int>("RateLimiting:CreatePerMinute", 5);
        var readLimit = configuration.GetValue<int>("RateLimiting:ReadPerMinute", 30);

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            options.AddPolicy(CreatePastePolicy, context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: GetClientIp(context),
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = createLimit,
                        Window = TimeSpan.FromMinutes(1),
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit = 0
                    }));

            options.AddPolicy(ReadPastePolicy, context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: GetClientIp(context),
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = readLimit,
                        Window = TimeSpan.FromMinutes(1),
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit = 0
                    }));
        });

        return services;
    }

    private static string GetClientIp(HttpContext context) =>
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
}
