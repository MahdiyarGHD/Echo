using Echo.Common.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Echo.Common.Services;


public sealed class PasteCleanupService(
    IServiceScopeFactory scopeFactory,
    ILogger<PasteCleanupService> logger)
    : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(6);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await Task.Delay(TimeSpan.FromMinutes(2), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<EchoDbContext>();

                var totalDeleted = await db.Pastes
                    .Where(x => x.ExpirationTime <= DateTime.UtcNow)
                    .ExecuteDeleteAsync(stoppingToken);

                if (totalDeleted > 0)
                    logger.LogInformation("Paste cleanup deleted {Count} rows", totalDeleted);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Paste cleanup failed.");
            }

            await Task.Delay(Interval, stoppingToken);
        }
    }
}

