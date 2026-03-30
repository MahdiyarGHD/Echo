using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Echo.Common.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Pastes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    AccessCode = table.Column<string>(type: "TEXT", maxLength: 5, nullable: false),
                    Content = table.Column<string>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true),
                    IsProtected = table.Column<bool>(type: "INTEGER", nullable: false),
                    ExpirationTime = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    CreatedBy = table.Column<string>(type: "TEXT", maxLength: 64, nullable: true),
                    ViewCount = table.Column<int>(type: "INTEGER", nullable: false),
                    IsExplosive = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pastes", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Pastes_AccessCode",
                table: "Pastes",
                column: "AccessCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Pastes");
        }
    }
}
