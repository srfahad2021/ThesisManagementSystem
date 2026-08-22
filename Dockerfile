# ==========================
# BUILD STAGE
# ==========================
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build

WORKDIR /src

COPY PracticumProjects.Server/PracticumProjects.Server.csproj PracticumProjects.Server/

RUN dotnet restore PracticumProjects.Server/PracticumProjects.Server.csproj

COPY . .

RUN dotnet publish PracticumProjects.Server/PracticumProjects.Server.csproj \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

# ==========================
# RUNTIME STAGE
# ==========================
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime

WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:10000
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 10000

ENTRYPOINT ["dotnet", "PracticumProjects.Server.dll"]