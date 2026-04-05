using Microsoft.AspNetCore.HttpOverrides;

namespace Echo.Common.Security;

public static class ForwardedHeadersConfiguration
{
    public static IApplicationBuilder UseEchoForwardedHeaders(this IApplicationBuilder app, IConfiguration configuration)
    {
        var options = new ForwardedHeadersOptions
        {
            ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto,
        };

        options.KnownNetworks.Clear();
        options.KnownProxies.Clear();

        var trustedNetworks = configuration.GetSection("Proxy:TrustedNetworks").Get<string[]>() ?? [];
        foreach (var network in trustedNetworks)
        {
            var parts = network.Split('/');
            if (parts.Length == 2
                && System.Net.IPAddress.TryParse(parts[0], out var address)
                && int.TryParse(parts[1], out var prefixLength))
            {
                options.KnownNetworks.Add(new IPNetwork(address, prefixLength));
            }
            else if (System.Net.IPAddress.TryParse(network, out var proxy))
            {
                options.KnownProxies.Add(proxy);
            }
            else
            {
                throw new InvalidOperationException(
                    $"Invalid proxy network entry '{network}' in Proxy:TrustedNetworks. " +
                    "Each entry must be a valid IP address or CIDR notation (e.g. '10.0.0.0/8').");
            }
        }

        return app.UseForwardedHeaders(options);
    }
}
