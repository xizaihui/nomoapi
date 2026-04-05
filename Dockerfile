FROM oven/bun:1-alpine AS frontend

WORKDIR /web
COPY web/package.json web/bun.lock ./
RUN bun install --frozen-lockfile
COPY web/ .
RUN bun run build

FROM golang:alpine AS builder

ENV GO111MODULE=on CGO_ENABLED=0

ARG TARGETOS
ARG TARGETARCH
ENV GOOS=${TARGETOS:-linux} GOARCH=${TARGETARCH:-amd64}
ENV GOEXPERIMENT=greenteagc

WORKDIR /build

ADD go.mod go.sum ./
RUN go mod download

COPY . .
COPY --from=frontend /web/dist /build/web/dist
RUN go build -ldflags "-s -w -X 'github.com/QuantumNous/new-api/common.Version=$(cat VERSION)'" -o new-api

FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata wget

COPY --from=builder /build/new-api /
EXPOSE 3000
WORKDIR /data
ENTRYPOINT ["/new-api"]
