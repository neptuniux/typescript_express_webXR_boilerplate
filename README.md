# Three.js WebXR Typescript Demo

  ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
  ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
  ![Threejs](https://img.shields.io/badge/threejs-black?style=for-the-badge&logo=three.js&logoColor=white)
  ![BuyMeACoffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)
 	
Welcome to my Three.js WebXR Typescript demo! This demo is a simple example of how to use Three.js, WebXR, and Typescript to create an immersive 3D scene in the browser.
## Technologies Used

**Express.JS** - A node js web application framework that provides broad features for building web and mobile applications. It's a layer built on the top of the Node js that helps manage servers and routes.

**Typescript** - A statically typed superset of Javascript that provides a more structured and scalable approach to programming.

**Three.js** - A popular Javascript library for creating 3D graphics in the browser. It provides a simple and intuitive API for creating and manipulating 3D objects, lights, cameras, and more.

**WebXR** - A web standard that allows developers to create immersive experiences using Virtual Reality (VR) and Augmented Reality (AR) devices.

## Installation
**Prerequisite:** To access the VR session with a VR headset you have to use HTTPS. Put your server.cert and the server.key in the security folder at the root.


1. Clone the project from GitHub:

```bash
git clone https://github.com/neptuniux/typescript_webXR_express.git
cd typescript_webXR_express
```

2. Install the required dependencies:

```bash
npm install
```

3. Build the project using the command:

```bash
npm start
```

The above command will use tsconfig.json as the configuration file for TypeScript and webpack.config.js for bundling the front-end page. This will generate the JavaScript files from the TypeScript source code.

4. Open a web browser and go to http://localhost:8080 or https://localhost:8081 to see the running demo.


That's it! You should now be able to run the project locally on your machine.
## Environment Variables

The project uses these environment variable to set a couple of parameters:

- `SERVER_PORT=8080`
- `SECURE_SERVER_PORT=8081`
- `HOST_URL=http://localhost:8080`

## Demo Features

- Simple and intuitive 3D scene using Three.js.
- Support for WebXR devices, such as VR headsets.
- Typescript implementation for a more structured and scalable codebase.

## Acknowledgements

This demo is built on top of the excellent Three.js library and the WebXR API, which are both open-source and free to use. I would like to thank the developers of these technologies for making this demo possible.
## License

This demo is released under the [MIT](https://choosealicense.com/licenses/mit/)
 License. Feel free to use it for any purpose, commercial or non-commercial, but please provide attribution to the original source.
