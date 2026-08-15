# syntax=docker/dockerfile:1

# =============================================================================
# React + Vite frontend — олон шаттай build.
#
#   deps  → npm ci (хамаарлууд)
#   dev   → Vite dev server, HMR-тэй
#   build → npm run build → /app/dist
#   prod  → nginx + статик файлууд. Node ОРОХГҮЙ (~50MB)
#
# Аль шатыг барихыг compose дахь `target:` шийднэ.
# =============================================================================


# ---------------------------------------------------------------- deps -----
FROM node:22-alpine AS deps

WORKDIR /app

# Зөвхөн манифестүүдийг хуулах нь Docker-ийн давхаргын кэшийг ашиглах гол арга:
# аппын код өөрчлөгдөхөд npm ci дахин ажиллахгүй.
COPY package.json package-lock.json ./

# npm install БИШ npm ci: lock файлыг яг таг дагана, шинэ хувилбар руу
# чимээгүй шинэчлэхгүй. Build давтагдах чанартай (reproducible) болно.
RUN npm ci


# ----------------------------------------------------------------- dev -----
FROM deps AS dev

COPY . .

EXPOSE 5173

# --host 0.0.0.0 заавал: Vite анхдагчаар localhost дээр сонсдог тул
# контейнерийн гаднаас хандах боломжгүй байдаг.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


# --------------------------------------------------------------- build -----
FROM deps AS build

# ⚠️ ЧУХАЛ: Vite нь VITE_* хувьсагчийг build хийх ҮЕД bundle дотор шууд
# бичдэг (src/api/client.js → import.meta.env.VITE_API_URL). Тиймээс энэ нь
# ARG байх ёстой — контейнер ажиллах үед compose-оос өгвөл ХЭТЭРХИЙ ОРОЙТСОН,
# утга нь аль хэдийн JS дотор хатуу бичигдсэн байна.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY . .

RUN npm run build


# ---------------------------------------------------------------- prod -----
FROM nginx:alpine AS prod

# SPA fallback тохиргоо. Үүнгүйгээр /books/42 дээр refresh дарахад nginx нь
# "books/42" нэртэй файл хайж 404 буцаана.
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
