using Echo.Common.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Echo.Common.Providers;

public class AccessCodeGenerator(EchoDbContext dbContext)
{
    private const string Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private const int CodeLength = 5;

    public async Task<string> GenerateUniqueCodeAsync(CancellationToken cancellationToken = default)
    {
        string code;
        do
        {
            code = GenerateCode();
        }
        while (await dbContext.Pastes.AnyAsync(p => p.AccessCode == code, cancellationToken));

        return code;
    }

    private static string GenerateCode()
    {
        var chars = new char[CodeLength];
        for (var i = 0; i < CodeLength; i++)
            chars[i] = Alphabet[System.Security.Cryptography.RandomNumberGenerator.GetInt32(Alphabet.Length)];
        return new string(chars);
    }
}
