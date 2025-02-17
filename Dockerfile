#base image layer, download official node.js image
FROM node:22-alpine

#Creates directory /app and sets working directory, all subsequent commands run here
WORKDIR /app

#copy file from host machine into docker image, put / at the end can create the folder if it does not exist 
COPY package*.json ./

#execute command in a shell inside the container environment
RUN npm ci

#COPY current files into current container
COPY . .

EXPOSE 3000

#the instruction that is to be executed when a docker container starts
CMD ["node","app.js"]