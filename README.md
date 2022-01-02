# docker-ssh-reverse-tunnel-example

This is a boilerplate to establish a reverse ssh tunnel to your web server.

## needs

### a local machine
- installed with `docker` and `docker-compose`

### a remote server in the internet
- you can use a low cost virtual private server (VPS)
- installed with `docker` and `docker-compose`
- running an individual tunnel proxy for header and response rewrites
- running jwilder/nginx-proxy

## setup

there are two `.env` files. edit them.

### local machine `.env` file

```dotenv
PROJECT_NAME=my_project_name

# ssh tunnel
TUNNEL_LOCAL_HOST=whoami
TUNNEL_LOCAL_PORT=8000
TUNNEL_REMOTE_HOST=*
TUNNEL_REMOTE_PORT=8084
TUNNEL_SSH_KEY_FILE=/home/my_local_username/.ssh/thetunnel
TUNNEL_SSH_KEY_USER=my_remote_username
TUNNEL_SSH_HOST=mydomain.tld
```

### the machine to machine ssh key
- Create a machine to machine ssh key with option `-N ""` and place em into the docker user's `.ssh` folder: `/home/my_local_username/.ssh/thetunnel`  
```bash
ssh-keygen -t ed25519 -C "my_remote_username" -f /home/my_local_username/.ssh/thetunnel -N ""
```
> Replace `my_local_username` with the user, who runs docker on the local machine  
> Replace `my_remote_username` with the user, who runs docker on the remote machine  

- Place the content of the public key `/home/my_local_username/.ssh/thetunnel.pub` on the remote machine into the `/home/my_remote_username/.ssh/authorized-keys` file.
### remote machine `.env` file

````dotenv
PROJECT_NAME=my_project_name

# tunnelproxy
APP_PORT=3000
TUNNEL_HOST=172.17.0.1:8084
TARGET_HOST=replace_this_hostname_and_port

# nginx proxy
VIRTUAL_HOST=subdomain.myhostname.tld
LETSENCRYPT_EMAIL=me@myhostname.tld
````
> `APP_PORT` is the outgoing port from the tunnelproxy, mapped on the virtual host  
> `TUNNEL_HOST` is the gate of the ssh tunnel and the source for the tunnelproxy   
> Replace `TARGET_HOST`. This hostname will be checked in the most cases from the / your webapp.  
> The `TARGET_HOST` will be replaced in the request headers and response body with `VIRTUAL_HOST` by the tunnelproxy.  
> Replace `VIRTUAL_HOST`. This is finally your domain or subdomain on the remote machine.

### remote machine tunnel proxy base auth
- Edit the file: `tunnelproxy/index.js` and replace:
````javascript
const auth = {
    admin: 'adminpass'
};
````

### the dummy app / your app
The file `local machine/docker-compose-app.yml` creates a dummy app. You can use it for your individual app.
But one important thing is needed: the network. The communication between the tunnel and the app needs an own network:
````yaml
...

networks:
  app:
    external: false
    name: ${PROJECT_NAME}_default

...

servicename:
    networks:
      - app
      - some-other-network

...
````

### start

- local machine
```bash
docker-compose -f docker-compose-app.yml
docker-compose -f docker-compose-tunnel.yml
```

- remote machine
```bash
docker-compose -f docker-compose-proxy.yml
docker-compose -f docker-compose-tunnelproxy.yml
```