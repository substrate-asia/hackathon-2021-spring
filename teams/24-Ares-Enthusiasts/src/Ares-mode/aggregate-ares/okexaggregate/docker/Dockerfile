FROM java:8
EXPOSE 8080
VOLUME /tmp
ADD app.jar  /app.jar
RUN bash -c 'touch /app.jar'
ENTRYPOINT ["sh","-c","java -jar app.jar ${BOOT_OPTIONS}"]
