using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Echo.Common.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPasteViews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PasteViews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    PasteId = table.Column<Guid>(type: "TEXT", nullable: false),
                    HashedIp = table.Column<string>(type: "TEXT", maxLength: 64, nullable: false),
                    ViewedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PasteViews", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PasteViews_PasteId_HashedIp",
                table: "PasteViews",
                columns: new[] { "PasteId", "HashedIp" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PasteViews");
        }
    }
}
