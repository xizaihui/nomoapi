FROM oven/bun:latest AS builder

WORKDIR /build
COPY web/package.json .
COPY web/bun.lock .
RUN bun install
COPY ./web .
RUN rm -rf dist
COPY ./VERSION .
RUN NODE_OPTIONS="--max-old-space-size=4096" DISABLE_ESLINT_PLUGIN='true' VITE_REACT_APP_VERSION=$(cat VERSION) bun run build

FROM golang:alpine AS builder2
ENV GO111MODULE=on CGO_ENABLED=0

ARG TARGETOS
ARG TARGETARCH
ENV GOOS=${TARGETOS:-linux} GOARCH=${TARGETARCH:-amd64}
ENV GOEXPERIMENT=greenteagc

WORKDIR /build

ADD go.mod go.sum ./
RUN go mod download

COPY . .
RUN rm -rf web/dist
COPY --from=builder /build/dist ./web/dist
RUN go build -ldflags "-s -w -X 'github.com/QuantumNous/new-api/common.Version=$(cat VERSION)'" -o new-api

FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata wget

COPY --from=builder2 /build/new-api /
EXPOSE 3000
WORKDIR /data
ENTRYPOINT ["/new-api"]
