[Help Home](readme.md)

# Admin - Getting Started

Managing municipal lottery licences is oftentimes a one or two person job.
While this application can run on a high end server, that is by no means a requirement.
Most user workstations are sufficient.

## Step 1: Install Node.js 14 or better and npm

[Node.js](https://nodejs.org) is a JavaScript runtime environment.
The Lottery Licence Manager is built to run on Node.js.

[npm](https://www.npmjs.com/) is a package manager that contains all the prerequisites
for the Lottery Licence Manager application.

Node.js can run on Windows, Mac, and Linux.
Installers on the [Node.js website](https://nodejs.org) include npm.
Node.js and npm are also available in most package managers.

    > sudo apt install nodejs
    > sudo apt install npm

## Step 2: Install git

*Alternatively, [releases are available on GitHub](https://github.com/cityssm/lottery-licence-manager/releases).  Git is not required when using releases.*

[Git](https://git-scm.com/) is the version control system that manages the
code for the Lottery Licence System.

Git can run on Windows, Mac, and Linux.
You can install it using an install on the [Git website](https://git-scm.com/),
or from most package managers.

    > sudo apt install git

## Step 3: Clone the `lottery-licence-manager` repository using git

Open a command line, and navigate to the folder where the application will reside.

    > git clone https://github.com/cityssm/lottery-licence-manager

## Step 4: Install the dependencies

    > cd lottery-licence-manager
    > npm install

## Step 5: Create a `config.js` file

It is recommended to copy the `configExample.js` file to get started.
It includes the base rules for the province of Ontario,
with the most commonly overridden settings.

    > cp data/configExample.js data/config.js

See the [config.js documentation](admin-configJS.md) for help customizing
your configuration.

## Step 6: Start the application

**Start Using npm**

    > npm start

**Start Using node**

    > node ./bin/www

**Start as a Windows Service**

The included `windowsService-install.bat` script simplifies
the process of keeping the application running in a Windows environment
by creating a service that can start with the hosting server.

    > npm link node-windows
    > windowsService-install
