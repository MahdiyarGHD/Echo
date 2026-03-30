using Echo.Features.Paste.Models;
using Microsoft.EntityFrameworkCore;

namespace Echo.Common.Persistence;

public class EchoDbContext(DbContextOptions<EchoDbContext> options) : DbContext(options)
{
    public DbSet<Paste> Pastes => Set<Paste>();

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
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        });
    }
}
