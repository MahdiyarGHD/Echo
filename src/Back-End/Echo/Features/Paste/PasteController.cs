using Echo.Common.Security;
using Echo.Features.Paste.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Echo.Features.Paste;

[ApiController]
[Route("pastes")]
public class PasteController(PasteService pasteService) : ControllerBase
{
    [HttpPost]
    [EnableRateLimiting(RateLimitingConfiguration.CreatePastePolicy)]
    public async Task<IActionResult> CreatePaste(
        [FromBody] CreatePasteRequest request,
        CancellationToken cancellationToken)
    {
        var response = await pasteService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetPaste), new { accessCode = response.AccessCode }, response);
    }

    [HttpGet("{accessCode}")]
    [EnableRateLimiting(RateLimitingConfiguration.ReadPastePolicy)]
    public async Task<IActionResult> GetPaste(
        [FromRoute] string accessCode,
        CancellationToken cancellationToken)
    {
        var response = await pasteService.GetByAccessCodeAsync(accessCode, cancellationToken);
        return Ok(response);
    }
}
