# WPBOT-PRO

> It's a Whatsapp API to integrate services like a chat-bot for example

**To Run**

1. Create a .env file with firebase credentials

2. Install [Docker](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/)

3. Run 

```bash
docker-compose up --build -d
```

## Features API

- [x]  Token to client management
    - [x]  Create Token
    - [x]  Update Token
    - [ ]  Update client info on update
    - [x]  Delete Token
        - [ ]  Close a browser on delete
        - [ ]  Update sessions on delete
        - [ ]  Destroy object on delete
    - [x]  Initialize Token
    - [x]  Initialize Token
- [x]  Get QrCode
- [x]  Get Token connection status
- [x]  Validade Whatsapp number
- [x]  Config debugger
- [ ]  Restart client
- [ ]  Create validation middlewares
- [ ]  Automatic deployment
- [ ]  Able multiple engine
- [ ]  Config a web socket event emitter
- [ ]  Config error reports on whatsapp

## Venom Bot Engine

- [x]  Update Status
- [x]  Get single QRCode

### Features API ⇒ Client

- [x]  Send Text Message
- [x]  Send Audio
- [x]  Send Image
- [x]  Send Video
- [x]  Send Files

### Features Client ⇒ Web Hook Bluml

- [x]  Receive Text Message
- [x]  Receive Audio
- [x]  Receive Image
- [x]  Receive Video
- [x]  Receive Files
- [x]  Receive Location
- [x]  Receive Contacts
- [x]  ACK Updates