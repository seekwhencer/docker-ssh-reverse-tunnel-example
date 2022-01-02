FROM alpine:3.15
RUN apk add --update openssh-client && rm -rf /var/cache/apk/*

CMD rm -rf /root/.ssh && mkdir /root/.ssh && chmod -R 600 /root/.ssh/*