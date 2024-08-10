##Build Phase

FROM golang:alpine AS builder
ENV CGO_ENABLED=1
RUN apk update && apk add --no-cache git gcc musl-dev sqlite
RUN mkdir /lib64 && ln -s /lib/libc.musl-x86_64.so.1 /lib64/ld-linux-x86-64.so.2

COPY backend/ .
RUN go get -d -v
RUN go build -v ./



RUN mkdir -p /app/frontend
RUN mkdir -p /app/backend
RUN cp /go/backend /app/backend/backend
COPY frontend /app/frontend

#Run Phase
#FROM scratch
FROM alpine
COPY --from=builder /app/backend/backend /app/backend/backend

COPY --from=builder /app /app
WORKDIR /app/backend
ENTRYPOINT [ "/app/backend/backend" ]
