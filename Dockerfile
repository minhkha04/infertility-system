FROM maven:3.9.9-amazoncorretto-24 AS build

WORKDIR /app
COPY pom.xml .
COPY src ./src

RUN mvn package -DskipTests

FROM amazoncorretto:24

WORKDIR /app
COPY --from=build /app/target/infertility-system-api-0.0.1.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]