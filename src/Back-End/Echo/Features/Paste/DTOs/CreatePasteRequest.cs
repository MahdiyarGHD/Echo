using Echo.Common.Options;
using FluentValidation;
using Microsoft.Extensions.Options;

namespace Echo.Features.Paste.DTOs;

public class CreatePasteRequest
{
    public string Content { get; set; } = string.Empty;
    public string? Title { get; set; }
    public bool IsProtected { get; set; }
    public DateTime? ExpirationTime { get; set; }
    public bool IsExplosive { get; set; }
}

public class CreatePasteRequestValidator : AbstractValidator<CreatePasteRequest>
{
    public CreatePasteRequestValidator(IOptions<PasteOptions> options)
    {
        var maxBytes = options.Value.MaxContentBytes;

        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Content is required.")
            .Must(c => System.Text.Encoding.UTF8.GetByteCount(c) <= maxBytes)
            .WithMessage($"Content must not exceed {maxBytes / 1024} KB.");

        RuleFor(x => x.Title)
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters.")
            .When(x => x.Title is not null);

        RuleFor(x => x.ExpirationTime)
            .Must(exp => exp > DateTime.UtcNow).WithMessage("ExpirationTime must be in the future.")
            .When(x => x.ExpirationTime.HasValue);
    }
}
