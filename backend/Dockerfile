FROM eclipse-temurin:21-jdk AS build

WORKDIR /app/backend

COPY --chmod=0755 backend/gradlew ./gradlew
COPY backend/gradle/ ./gradle/
COPY backend/build.gradle.kts backend/settings.gradle.kts ./
COPY backend/src/main/ ./src/main/
COPY openapi/dist/openapi.yaml /app/openapi/dist/openapi.yaml

RUN ./gradlew bootJar --no-daemon


FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/backend/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
