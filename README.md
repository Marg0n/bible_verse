<!-- <p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p> -->

<div align="center">
  <h1>Bible Verse</h1>
</div>   

## Description

A backend project for daily widget style Holy Bible verse & quotes. Powered by [Nest](https://github.com/nestjs/nest) framework TypeScript.

## Development Project setup

```bash
$ npm install
```

## Run Docker

### Install Docker

Go to [Docker Desktop]("https://www.docker.com/products/docker-desktop/?utm_source=chatgpt.com") and install it.

After installation:

```bash
# Version check
docker --version
```

Expected result:

```bash
Docker version xx.x.x
```

Next check the compose version:

```bash
# Docker compose version
docker compose version
```

Expected result:

```bash
Docker Compose version xx.x.x
```

Then run in a separate terminal:

```bash
# starting docker
docker compose up -d
```

```bash
# Verify if needed
docker ps
```

```bash
# closing docker
docker compose down
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Libraries highlights

- Prisma
- Passport &  Passport-jwt
- Swagger
- Throttler
- Bcrypt
- Redis
- Class-validator and transformer
- Zod

### Clear usage view:

<!-- 
| Category | Feature | Status |
| :--- | :--- | :---: |
| **Infrastructure** | Docker | ✅ |
| | PostgreSQL | ✅ |
| | Redis | ✅ |
| | Environment validation (Zod) | ✅ |
| | Typed config started | ✅ |
| **Security** | JWT Access Token | ✅ |
| | Refresh Token Rotation | ✅ |
| | Password hashing | ✅ |
| | Global Validation | ✅ |
| | Rate Limiting | ✅ |
| | Custom 429 response | ✅ |
| | Global Exception Filter | ✅ |
| **Performance** | Redis caching | ✅ |
| | Request logging | ✅ |
| | Health Check| ⬜ |
| | Cache logging (HIT/MISS) | ✅ |    -->

| Feature Category | Implemented Features |
| :--- | :--- |
| **Infrastructure** | ✅ Docker<br>✅ PostgreSQL<br>✅ Redis<br>✅ Environment validation (Zod)<br>✅ Typed config<br>✅ Health endpoint |
| **Security** | ✅ JWT Access Token<br>✅ Refresh Token Rotation<br>✅ Password hashing<br>✅ Global Validation<br>✅ Rate Limiting<br>✅ Custom 429 response<br>✅ Global Exception Filter<br>✅ Request Validation<br>✅ Guards<br>✅ Hashed OTP Validation<br> |
| **API** | ✅ Validation<br>✅ Swagger<br>✅ DTOs<br>✅ Exception Filter |   
| **Performance** | ✅ Redis caching<br>✅ Request logging<br>✅ Cache logging (HIT/MISS)<br>✅ Rate limiting |   
| **Production** | ✅ Health checks<br>✅ Environment validation<br>✅ Horizontal Scaling with nginx<br> |   

## Roadmaps

- [ ] Push notifications for daily reminders
- [ ] User accounts + cloud sync
- [ ] Horizontal Scaling
- [ ] Search verses by keyword
- [ ] AI-powered verse recommendations
- [ ] AI bot that explains the verse
- [ ] Performance tuning (memoization, caching)
- [ ] Continuous backend improvements
- [ ] Web extension development
- [ ] Release mobile app version (Android and IOS)

## Project Devs

<!-- Developed by [Sokhorio Margon D' Costa](https://github.com/Marg0n)    -->
<a href="https://github.com/Marg0n/bible_verse/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Marg0n/bible_verse" alt="contributors" title="contributors"/>
</a>

## Related to the Project

These are the related projects for this particular backend:

- #### [Web Extension](https://github.com/Marg0n/bible_verse_web_extension)
- #### [Mobile App](https://github.com/Marg0n/bible_verse_mobile_app?tab=readme-ov-file)

## License

[Copyright](https://github.com/Marg0n/bible_verse/blob/dev/NOTICE.md) is being reserved by the [Author](https://github.com/Marg0n/bible_verse/blob/main/AUTHORS).
<br/>
