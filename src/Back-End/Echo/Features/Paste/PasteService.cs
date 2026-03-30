using Echo.Common.Exceptions;
using Echo.Common.Persistence;
using Echo.Common.Providers;
using Echo.Features.Paste.DTOs;
using Echo.Features.Paste.Models;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Echo.Features.Paste;

public class PasteService(
    EchoDbContext dbContext,
    AccessCodeGenerator codeGenerator,
    IValidator<CreatePasteRequest> validator,
    IHttpContextAccessor httpContextAccessor,
    ILogger<PasteService> logger)
{
    public async Task<PasteResponse> CreateAsync(CreatePasteRequest request, CancellationToken cancellationToken = default)
    {
        await validator.ValidateAndThrowAsync(request, cancellationToken);

        var accessCode = await codeGenerator.GenerateUniqueCodeAsync(cancellationToken);
        var clientIp = httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
        var createdBy = clientIp is null ? null : HashIp(clientIp);

        var paste = new Models.Paste
        {
            Id = Guid.NewGuid(),
            AccessCode = accessCode,
            Content = request.Content,
            Title = request.Title,
            IsProtected = request.IsProtected,
            ExpirationTime = DateTime.UtcNow.AddHours(request.ExpireHours),
            CreatedAt = DateTime.UtcNow,
            CreatedBy = createdBy,
            ViewCount = 0,
            IsExplosive = request.IsExplosive
        };

        dbContext.Pastes.Add(paste);
        await dbContext.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Paste created with access code '{AccessCode}'.", accessCode);

        return PasteResponse.FromPaste(paste);
    }

    public async Task<PasteResponse> GetByAccessCodeAsync(string accessCode, CancellationToken cancellationToken = default)
    {
        var paste = await dbContext.Pastes
            .FirstOrDefaultAsync(p => p.AccessCode == accessCode, cancellationToken)
            ?? throw new NotFoundException($"Paste with access code '{accessCode}' was not found.");

        if (paste.ExpirationTime.HasValue && paste.ExpirationTime.Value < DateTime.UtcNow)
        {
            logger.LogInformation("Access to expired paste '{AccessCode}' was attempted.", accessCode);
            throw new NotFoundException($"Paste with access code '{accessCode}' has expired.");
        }

        if (paste.IsExplosive)
        {
            dbContext.Pastes.Remove(paste);
            logger.LogInformation("Explosive paste '{AccessCode}' was read and deleted.", accessCode);
        }
        else
        {
            var clientIp = httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
            var hashedIp = clientIp is null ? null : HashIp(clientIp);

            var alreadyViewed = hashedIp is not null && await dbContext.PasteViews
                .AnyAsync(v => v.PasteId == paste.Id
                    && v.HashedIp == hashedIp
                    && v.ViewedAt >= DateTime.UtcNow.AddHours(-24), cancellationToken);

            if (!alreadyViewed)
            {
                paste.ViewCount++;

                if (hashedIp is not null)
                {
                    dbContext.PasteViews.Add(new PasteView
                    {
                        Id = Guid.NewGuid(),
                        PasteId = paste.Id,
                        HashedIp = hashedIp,
                        ViewedAt = DateTime.UtcNow
                    });
                }

                logger.LogInformation("Paste '{AccessCode}' retrieved. View count: {ViewCount}.", accessCode, paste.ViewCount);
            }
            else
            {
                logger.LogInformation("Paste '{AccessCode}' retrieved by returning IP. View count unchanged: {ViewCount}.", accessCode, paste.ViewCount);
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        return PasteResponse.FromPaste(paste);
    }

    private static string HashIp(string ip)
    {
        var bytes = System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(ip));
        return Convert.ToHexString(bytes)[..16];
    }
}
