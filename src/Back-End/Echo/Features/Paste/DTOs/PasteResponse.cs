namespace Echo.Features.Paste.DTOs;

public class PasteResponse
{
    public string AccessCode { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Title { get; set; }
    public bool IsProtected { get; set; }
    public DateTime? ExpirationTime { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ViewCount { get; set; }
    public bool IsExplosive { get; set; }

    public static PasteResponse FromPaste(Models.Paste paste) => new()
    {
        AccessCode = paste.AccessCode,
        Content = paste.Content,
        Title = paste.Title,
        IsProtected = paste.IsProtected,
        ExpirationTime = paste.ExpirationTime,
        CreatedAt = paste.CreatedAt,
        ViewCount = paste.ViewCount,
        IsExplosive = paste.IsExplosive
    };
}
