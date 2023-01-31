
FROM ubuntu:16.04
ENV NODE_VERSION=16
ENV NPM_VERSION=8

# Update the repository sources list and install dependencies
RUN apt-get update

# Set the locale
RUN apt-get update && apt-get install -y locales

#Install XVFB
RUN echo "Installing Visual Interface (XVFB)"
RUN apt-get --assume-yes install libgtk-3-0 libdbus-glib-1-2 libasound2 libgtk2.0-0 apt-utils > /dev/null
RUN apt-get -qq --assume-yes install xvfb

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

# Install NPM and NODE
RUN apt-get install curl --assume-yes
RUN curl -sL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
RUN export NODE_OPTIONS=--max_old_space_size=6000
RUN npm i -g npm@${NPM_VERSION}
RUN apt-get install -y nodejs
RUN npm install -g vsce

# Final user and home config
RUN useradd --create-home --shell /bin/bash jenkins
USER jenkins
WORKDIR /home/jenkins

RUN echo "NODE Version:" && node --version
RUN echo "NPM Version:" && npm --version
RUN echo "VSCode Extension Version:" && vsce --version