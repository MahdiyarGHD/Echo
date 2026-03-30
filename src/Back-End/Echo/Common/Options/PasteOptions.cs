namespace Echo.Common.Options;

public class PasteOptions
{
    public const string SectionName = "Paste";

    public int MaxContentBytes { get; set; } = 50 * 1024;
}
