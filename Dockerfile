# ---------- Build Stage ----------
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build

WORKDIR /src

# Copy everything from the server folder
COPY . .

# Restore packages
RUN dotnet restore PracticumProjects.Server.csproj

# Publish
RUN dotnet publish PracticumProjects.Server.csproj -c Release -o /app/publish

# ---------- Runtime Stage ----------
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview

WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:10000

EXPOSE 10000

ENTRYPOINT ["dotnet", "PracticumProjects.Server.dll"]