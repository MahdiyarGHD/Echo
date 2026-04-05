FROM dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["src/Back-End/Echo/Echo.csproj", "Back-End/Echo/"]
RUN dotnet restore "Back-End/Echo/Echo.csproj"

COPY src/Back-End/Echo/ Back-End/Echo/
WORKDIR /src/Back-End/Echo
RUN dotnet publish -c Release -o /app/publish

FROM mcr.hamdocker.ir/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "Echo.dll"]
