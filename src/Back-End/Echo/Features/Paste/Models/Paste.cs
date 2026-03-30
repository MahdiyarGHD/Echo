namespace Echo.Features.Paste.Models;

public class Paste
{
    public Guid Id { get; set; }
    public string AccessCode { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Title { get; set; }
    public bool IsProtected { get; set; }
    public DateTime? ExpirationTime { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public int ViewCount { get; set; }
    public bool IsExplosive { get; set; }
}
