namespace Echo.Common.Options;

public class DatabaseMaintenanceOptions
{
    public const string SectionName = "DatabaseMaintenance";

    public long MaxSizeBytes { get; set; } = 100 * 1024 * 1024;
    public int CheckIntervalMinutes { get; set; } = 60;
    public int DeletionBatchSize { get; set; } = 100;
}
