FROM alpine:latest
LABEL maintainer Ethan Dinnen <ethanjdinnen@gmail.com>
RUN apk add --no-cache curl bzip2 wget
WORKDIR /
RUN curl -k http://ftp.fau.de/kiwix/bin/0.10/kiwix-0.10-linux-x86_84.tar.bz2 | tar -xj
RUN mv kiwix-* /kiwix
WORKDIR /kiwix-data
VOLUME /kiwix-data
# Download wikivoyage for testing purposes due to small size
RUN wget http://download.kiwix.org/zim/wikivoyage_en_all_nopic.zim
# RUN wget http://download.kiwix.org/zim/wikipedia_en_all_nopic.zim
# The below two lines are for full wikipeia -- 54GB; the above are for light -- 16GB
# RUN wget http://download.kiwix.org/zim/wikipedia_en_all.zim
EXPOSE 8080
ENTRYPOINT ["/kiwix/bin/kiwix-serve", "--port", "8080", "/kiwix-data/wikivoyage_en_all_nopic.zim"]
