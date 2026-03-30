using Echo.Common.Options;
using Echo.Common.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Data.Common;

namespace Echo.Common.Services;

public class DatabaseMaintenanceService(
    IServiceScopeFactory scopeFactory,
    IOptions<DatabaseMaintenanceOptions> options,
    ILogger<DatabaseMaintenanceService> logger) : BackgroundService
{
    private readonly DatabaseMaintenanceOptions _options = options.Value;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation(
            "Database maintenance service started. Interval: {Interval} min, Limit: {Limit:N0} bytes.",
            _options.CheckIntervalMinutes, _options.MaxSizeBytes);

        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(TimeSpan.FromMinutes(_options.CheckIntervalMinutes), stoppingToken);

            try
            {
                await EnforceSizeLimitAsync(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "An error occurred during database maintenance.");
            }
        }
    }

    private async Task EnforceSizeLimitAsync(CancellationToken cancellationToken)
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<EchoDbContext>();

        var currentSize = await GetDatabaseSizeBytesAsync(dbContext, cancellationToken);
        logger.LogInformation(
            "Database size check: {Size:N0} bytes (limit: {Limit:N0} bytes).",
            currentSize, _options.MaxSizeBytes);

        if (currentSize <= _options.MaxSizeBytes)
            return;

        logger.LogWarning(
            "Database size {Size:N0} bytes exceeds limit {Limit:N0} bytes. Starting cleanup.",
            currentSize, _options.MaxSizeBytes);

        int totalDeleted = 0;

        while (currentSize > _options.MaxSizeBytes)
        {
            var batch = await dbContext.Pastes
                .OrderBy(p => p.CreatedAt)
                .Take(_options.DeletionBatchSize)
                .ToListAsync(cancellationToken);

            if (batch.Count == 0)
            {
                logger.LogWarning("No more pastes to delete; database may still exceed the size limit.");
                break;
            }

            dbContext.Pastes.RemoveRange(batch);
            await dbContext.SaveChangesAsync(cancellationToken);
            totalDeleted += batch.Count;

            currentSize = await GetDatabaseSizeBytesAsync(dbContext, cancellationToken);
            logger.LogDebug(
                "Deleted batch of {Count} pastes. Current size: {Size:N0} bytes.",
                batch.Count, currentSize);
        }

        if (totalDeleted > 0)
        {
            logger.LogInformation("Deleted {Total} pastes. Running VACUUM to reclaim space.", totalDeleted);
            await dbContext.Database.ExecuteSqlRawAsync("VACUUM");
            var finalSize = await GetDatabaseSizeBytesAsync(dbContext, cancellationToken);
            logger.LogInformation("VACUUM complete. Final database size: {Size:N0} bytes.", finalSize);
        }
    }

    private static async Task<long> GetDatabaseSizeBytesAsync(EchoDbContext dbContext, CancellationToken cancellationToken)
    {
        var connection = dbContext.Database.GetDbConnection();
        var wasOpen = connection.State == System.Data.ConnectionState.Open;

        if (!wasOpen)
            await connection.OpenAsync(cancellationToken);

        try
        {
            return await QueryDatabaseSizeAsync(connection);
        }
        finally
        {
            if (!wasOpen)
                await connection.CloseAsync();
        }
    }

    private static async Task<long> QueryDatabaseSizeAsync(DbConnection connection)
    {
        await using var cmd = connection.CreateCommand();

        cmd.CommandText = "PRAGMA page_count";
        var pageCount = Convert.ToInt64(await cmd.ExecuteScalarAsync());

        cmd.CommandText = "PRAGMA page_size";
        var pageSize = Convert.ToInt64(await cmd.ExecuteScalarAsync());

        return pageCount * pageSize;
    }
}
