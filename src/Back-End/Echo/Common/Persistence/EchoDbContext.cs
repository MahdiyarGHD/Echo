using Echo.Features.Paste.Models;
using Microsoft.EntityFrameworkCore;

namespace Echo.Common.Persistence;

public class EchoDbContext(DbContextOptions<EchoDbContext> options) : DbContext(options)
{
    public DbSet<Paste> Pastes => Set<Paste>();
    public DbSet<PasteView> PasteViews => Set<PasteView>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Paste>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.AccessCode)
                .IsRequired()
                .HasMaxLength(5);

            entity.HasIndex(e => e.AccessCode)
                .IsUnique();

            entity.Property(e => e.Content)
                .IsRequired();

            entity.Property(e => e.Title)
                .HasMaxLength(200);

            entity.Property(e => e.CreatedBy)
                .HasMaxLength(64);

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()");
        });

        modelBuilder.Entity<PasteView>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.HashedIp)
                .IsRequired()
                .HasMaxLength(64);

            entity.HasIndex(e => new { e.PasteId, e.HashedIp });
        });
    }
}
