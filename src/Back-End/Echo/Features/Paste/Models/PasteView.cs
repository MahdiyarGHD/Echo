namespace Echo.Features.Paste.Models;

public class PasteView
{
    public Guid Id { get; set; }
    public Guid PasteId { get; set; }
    public string HashedIp { get; set; } = string.Empty;
    public DateTime ViewedAt { get; set; }
}
