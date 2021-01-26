
FROM ubuntu:16.04

# Update the repository sources list and install dependencies
RUN apt-get update

# Set the locale
RUN apt-get update && apt-get install -y locales
RUN echo "en_US UTF-8" >> /etc/locale.gen
RUN dpkg-reconfigure locales
RUN locale-gen en_US.UTF-8
RUN localedef -c -i en_US -f UTF-8 en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

# Install JDK 8
RUN apt-get install -y software-properties-common unzip htop rsync openssh-client jq
RUN apt-get update
RUN add-apt-repository ppa:openjdk-r/ppa
RUN apt-get update
RUN apt-get install openjdk-8-jdk --assume-yes

# Final user and home config
RUN useradd --create-home --shell /bin/bash jenkins
USER jenkins
WORKDIR /home/jenkins